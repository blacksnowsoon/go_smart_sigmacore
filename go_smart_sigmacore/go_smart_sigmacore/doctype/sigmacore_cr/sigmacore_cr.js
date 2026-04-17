// Copyright (c) 2026, Gharieb Khalifa and contributors
// For license information, please see license.txt

frappe.ui.form.on("SigmaCore CR", {
	refresh(frm) {
		frm.fields_dict["cr_preview"].tab.tab_link.on("click", () => {
			render_cr_preview(frm);
		});
	},
});

function get_preview_target(frm) {
	const $field = $(frm.fields_dict["cr_preview"].wrapper);
	return $field.find(".html-field-content").length
		? $field.find(".html-field-content")
		: $field;
}

function render_cr_preview(frm) {
	if (frm.doc.__islocal) {
		get_preview_target(frm).html(
			`<div style="padding:40px 28px;color:var(--text-muted,#94a3b8);font-size:0.9rem;">
				Save the document first to see the preview.
			</div>`
		);
		return;
	}

	const $target = get_preview_target(frm);

	// ── Loading state ────────────────────────────────────────
	$target.html(`
		<div style="display:flex;align-items:center;gap:12px;padding:40px 28px;color:var(--text-muted,#94a3b8);">
			<div class="sc-spinner"></div>
			<span style="font-size:0.9rem;">Building preview…</span>
		</div>
		<style>
			.sc-spinner {
				width: 20px; height: 20px;
				border: 2px solid var(--border-color,#e2e8f0);
				border-top-color: var(--primary-color,#4f46e5);
				border-radius: 50%;
				animation: sc-spin 0.7s linear infinite;
			}
			@keyframes sc-spin { to { transform: rotate(360deg); } }
		</style>
	`);

	// ── Fetch rendered HTML from server ──────────────────────
	frappe.call({
		method: "go_smart_sigmacore.go_smart_sigmacore.doctype.sigmacore_cr.sigmacore_cr.get_cr_preview",
		args: { docname: frm.doc.name },
		callback(r) {
			$target.html(r.message || "");
		},
		error() {
			$target.html(
				`<div style="padding:40px 28px;color:var(--red-500,#ef4444);font-size:0.9rem;">
					Failed to load preview.
				</div>`
			);
		},
	});
}

