// Copyright (c) 2026, Gharieb Khalifa and contributors
// For license information, please see license.txt

frappe.ui.form.on("SigmaCore CR", {
	refresh(frm) {
		frm.fields_dict['cr_preview'].tab.tab_link.on('click',() =>{
      render_cr_preview(frm);
    });
	},

});

function render_cr_preview(frm) {
	const doc = frm.doc;

	/* ── Loading state ─────────────────────────────────────── */
	const $field = $(frm.fields_dict["cr_preview"].wrapper);
	const $target = $field.find(".html-field-content").length
		? $field.find(".html-field-content")
		: $field;

	$target.html(`
		<div style="display:flex;align-items:center;gap:12px;padding:40px 28px;color:var(--text-muted,#94a3b8);">
			<div class="sc-spinner"></div>
			<span style="font-size:0.9rem;">Building preview…</span>
		</div>
		<style>
			.sc-spinner {
				width: 20px; height: 20px;
				border: 2px solid var(--border-color, #e2e8f0);
				border-top-color: var(--primary-color, #4f46e5);
				border-radius: 50%;
				animation: sc-spin 0.7s linear infinite;
			}
			@keyframes sc-spin { to { transform: rotate(360deg); } }
		</style>
	`);

	/* ── Analysts ─────────────────────────────────────────── */
	const analysts = (doc.analysts_by || [])
		.map(row => `<span class="sc-analyst-badge">${frappe.utils.escape_html(row.analyst_name || row.analyst || "—")}</span>`)
		.join(" ");

	const analysts_html = analysts
		? `<div class="sc-section">
				<div class="sc-section-title">Analyst(s)</div>
				<div class="sc-analysts-list">${analysts}</div>
			</div>`
		: "";

	/* ── Scopes ───────────────────────────────────────────── */
	const scopes_rows = (doc.scopes || []).map(row => {
		const parts = [row.module_name, row.section, row.target]
			.filter(v => v)
			.map(v => frappe.utils.escape_html(v));
		return `<div class="sc-scope-row">${parts.join(' <span class="sc-sep">/</span> ')}</div>`;
	}).join("");

	const scopes_html = scopes_rows
		? `<div class="sc-section">
				<div class="sc-section-title">Scopes</div>
				<div class="sc-scopes-list">${scopes_rows}</div>
			</div>`
		: "";

	/* ── Requirements ─────────────────────────────────────── */
	const requirements_html = (doc.requirments || []).map(row => {
		const title = frappe.utils.escape_html(row.requirement || "");
		const note  = frappe.utils.escape_html(row.note || "");
		return `<div class="sc-requirement-block">
			${title ? `<h2 class="sc-req-title">${title}</h2>` : ""}
			${note  ? `<p  class="sc-req-note">${note}</p>`  : ""}
		</div>`;
	}).join("");

	const requirements_section = requirements_html
		? `<div class="sc-section">
				<div class="sc-section-title">Requirements</div>
				${requirements_html}
			</div>`
		: "";

	/* ── Final HTML ───────────────────────────────────────── */
	const html = `
<style>
	.sc-preview-wrapper {
		font-family: var(--font-stack, 'Inter', sans-serif);
		padding: 24px 28px;
		color: var(--text-color, #1a1a2e);
	}
	.sc-cr-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 28px;
		padding-bottom: 18px;
		border-bottom: 2px solid var(--border-color, #e2e8f0);
	}
	.sc-cr-title {
		font-size: 1.6rem;
		font-weight: 700;
		color: var(--heading-color, #1e3a5f);
		margin: 0 0 6px;
	}
	.sc-cr-meta {
		font-size: 0.82rem;
		color: var(--text-muted, #64748b);
		display: flex;
		gap: 18px;
		flex-wrap: wrap;
	}
	.sc-cr-meta span { display: flex; align-items: center; gap: 4px; }
	.sc-status-badge {
		display: inline-block;
		padding: 3px 12px;
		border-radius: 999px;
		font-size: 0.78rem;
		font-weight: 600;
		background: var(--primary-color, #4f46e5);
		color: #fff;
	}
	.sc-section {
		margin-bottom: 28px;
	}
	.sc-section-title {
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-muted, #94a3b8);
		margin-bottom: 10px;
	}
	.sc-analysts-list { display: flex; flex-wrap: wrap; gap: 8px; }
	.sc-analyst-badge {
		background: var(--bg-blue-light, #eff6ff);
		color: var(--blue-500, #3b82f6);
		border: 1px solid var(--blue-200, #bfdbfe);
		border-radius: 999px;
		padding: 4px 14px;
		font-size: 0.85rem;
		font-weight: 500;
	}
	.sc-scopes-list { display: flex; flex-direction: column; gap: 6px; }
	.sc-scope-row {
		background: var(--control-bg, #f8fafc);
		border: 1px solid var(--border-color, #e2e8f0);
		border-radius: 6px;
		padding: 8px 14px;
		font-size: 0.88rem;
		color: var(--text-color, #334155);
	}
	.sc-sep { color: var(--text-muted, #94a3b8); margin: 0 4px; }
	.sc-requirement-block {
		border-left: 3px solid var(--primary-color, #4f46e5);
		padding: 10px 16px;
		margin-bottom: 16px;
		background: var(--control-bg, #f8fafc);
		border-radius: 0 6px 6px 0;
	}
	.sc-req-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--heading-color, #1e3a5f);
		margin: 0 0 6px;
	}
	.sc-req-note {
		font-size: 0.875rem;
		color: var(--text-color, #475569);
		margin: 0;
		white-space: pre-wrap;
	}
</style>
<div class="sc-preview-wrapper">

	<div class="sc-cr-header">
		<div>
			<h1 class="sc-cr-title">${frappe.utils.escape_html(doc.title || doc.name || "—")}</h1>
			<div class="sc-cr-meta">
				<span>📋 ${frappe.utils.escape_html(doc.name || "")}</span>
				${doc.requestor ? `<span>👤 ${frappe.utils.escape_html(doc.requestor)}</span>` : ""}
				${doc.priority   ? `<span>🔺 ${frappe.utils.escape_html(doc.priority)}</span>`  : ""}
				${doc.site       ? `<span>🏢 ${frappe.utils.escape_html(doc.site.site_name)}</span>`       : ""}
			</div>
		</div>
		${doc.status ? `<div><span class="sc-status-badge">${frappe.utils.escape_html(doc.status)}</span></div>` : ""}
	</div>

	${analysts_html}
	${scopes_html}
	${requirements_section}

</div>`;

	// Swap spinner out with finished preview
	$target.html(html);
}
