// Copyright (c) 2026, Gharieb Khalifa and contributors
// For license information, please see license.txt

frappe.ui.form.on("SigmaCore CR", {
	refresh(frm) {
		frm.fields_dict["cr_preview"].tab.tab_link.on("click", () => {
			render_cr_preview(frm);
		});
		frm.fields_dict["cr_pdf"].tab.tab_link.on("click", () => {
			
			render_pdf_view(frm)
		})
	},
});

function render_cr_preview(frm) {
	if (frm.doc.__islocal) {
		get_preview_target(frm, "cr_preview").html(
			`<div style="padding:40px 28px;color:var(--text-muted,#94a3b8);font-size:0.9rem;">
				Save the document first to see the preview.
			</div>`
		);
		return;
	}

	const $target = get_preview_target(frm, "cr_preview");
	// ── Loading state ────────────────────────────────────────
	loading_state($target)

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

async function render_pdf_view(frm) {
	if (frm.doc.__islocal) {
		get_preview_target(frm, 'cr_pdf').html(
			`<div style="padding:40px 28px;color:var(--text-muted,#94a3b8);font-size:0.9rem;">
				Save the document first to see the PDF.
			</div>`
		);
		return;
	}
	
	const $target = get_preview_target(frm, 'cr_pdf')
	// ── Loading state ────────────────────────────────────────
	loading_state($target)
	
	// ── generate PDF ────────────────────────────────────────
	const format = "SigmaCore CR Builder"
	const options = {
		"page-size": "A4",
		"title": frm.doc.name,
		"author": "Gosmart-SigmaCore",
		"name": frm.doc.name,
		"margin": "5"
		
	}
	const pdf_url = generate_pdf_url(frm, format, options)

	try {
		
		// Create the iframe
		const iframe = document.createElement('iframe');
		iframe.style.cssText = `width: 100%; height: 100vh; border: none; opacity: 0;`;
		iframe.title = "SigmaCore"
		iframe.loading="lazy"
		iframe.referrerpolicy="no-referrer"
		
		iframe.src = pdf_url;
		
		$target.append(iframe);

		iframe.onload = ()=> {
			$target.find('*').not(iframe).remove(); // remove loader
			iframe.style.opacity = '1'; // fade in
		}
		iframe.onerror = () => {
			$target.html(`<div class="alert alert-danger">Failed to load PDF</div>`);
		};
        
	} catch (err) {
		$target.html(`<div class="alert alert-danger">${err.message}</div>`)
	}
}

