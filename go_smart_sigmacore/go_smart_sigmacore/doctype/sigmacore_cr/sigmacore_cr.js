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

function get_preview_target(frm, target) {
	const $field = $(frm.fields_dict[target].wrapper);
	return $field.find(".html-field-content").length
		? $field.find(".html-field-content")
		: $field;
}

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
		"name": frm.doc.name
		
	}
	const pdf_url = generate_pdf_url(frm, format, options)

	try {
		// Fetch with explicit Blob handling
		const response = await fetch(pdf_url)
		if (!response.ok) throw new Error('Network response was not ok')
		
		// Create the iframe
        const iframe = document.createElement('iframe');
        iframe.style.cssText = `width: 100%; height: 100vh; border: none; display: block;`;
		iframe.src = pdf_url;
        
        // Update the target immediately (Don't wait for onload to append)
        $target.empty().append(iframe);
        
        
       
	} catch (err) {
		$target.html(`<div class="alert alert-danger">${err.message}</div>`)
	}
}

// ── Loading state ────────────────────────────────────────

function loading_state($target){
	$target.html(`
		<div style="display:flex;align-items:center;gap:12px;padding:40px 28px;color:var(--text-muted,#94a3b8);">
			<div class="sc-spinner"></div>
			<span class="progress-text" style="font-size:0.9rem;">${__('Building View…')}</span>
		</div>
		<style>
			.sc-spinner {
				width: 20px; height: 20px;
				border: 2px solid var(--border-color,#e2e8f0);
				border-top-color: var(--primary-color,#4f46e5);
				border-radius: 50%;
				animation: sc-spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
			}
			@keyframes sc-spin { to { transform: rotate(360deg); } }
		</style>
	`);
}

// ──  Generate PDF URL ────────────────────────────────────────
function generate_pdf_url(frm, format, options) {
// http://192.168.78.129:8001/api/method/frappe.utils.print_format.download_multi_pdf?doctype=SigmaCore%20CR&name=%5B%22CR-04-26-18969%22%5D&format=SigmaCore%20CR%20Builder&no_letterhead=1&letterhead=No%20Letterhead&options=%7B%22page-size%22%3A%22A4%22%7D
	return `/api/method/frappe.utils.print_format.download_pdf?` +
		`doctype=${encodeURIComponent(frm.doctype)}` +
		`&name=${encodeURIComponent(frm.doc.name)}` +
		`&format=${encodeURIComponent(format)}` +
		`&no_letterhead=1` +
		`&letterhead=${encodeURIComponent('No Letterhead')}` +
		`&options=${encodeURIComponent(JSON.stringify(options))}` +
		`&_=${new Date().getTime()}`;
}

// async function render_pdf_view(frm) {
//     if (frm.doc.__islocal) {
//         get_preview_target(frm, 'cr_pdf').html(
//             `<div style="padding:40px 28px;color:var(--text-muted,#94a3b8);font-size:0.9rem;">
//                 Save the document first to see the PDF.
//             </div>`
//         );
//         return;
//     }
    
//     const $target = get_preview_target(frm, 'cr_pdf');
//     loading_state($target);
    
//     const format = "SigmaCore CR Builder";
//     const options = {
//         "page-size": "A4",
//         "title": frm.doc.name,
//         "author": "Gosmart-SigmaCore",
//         "name": frm.doc.name
//     };
    
//     const pdf_url = generate_pdf_url(frm, format, options);

//     try {
//         // Use XMLHttpRequest to track progress
//         const blob = await new Promise((resolve, reject) => {
//             const xhr = new XMLHttpRequest();
//             xhr.open('GET', pdf_url, true);
//             xhr.responseType = 'blob';

//             xhr.onprogress = (event) => {
//                 if (event.lengthComputable) {
//                     const percent = Math.round((event.loaded / event.total) * 100);
//                     // Update the loading text with percentage
//                     $target.find('span').text(`${__('Building View…')} ${percent}%`);
//                 }
//             };

//             xhr.onload = () => {
//                 if (xhr.status === 200) resolve(xhr.response);
//                 else reject(new Error(`Exit status: ${xhr.status}`));
//             };

//             xhr.onerror = () => reject(new Error('Network error'));
//             xhr.send();
//         });

//         // ── Fix File Name ──
//         // We create the blob with the specific name in the constructor (supported by some viewers)
//         const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        
//         // To force the filename in the PDF viewer header:
//         // We append the filename as a hash to the URL. Many browsers use this for the title.
//         const filename = `${frm.doc.name}.pdf`;
//         const local_url = URL.createObjectURL(pdfBlob) + `#title=${encodeURIComponent(filename)}&filename=${encodeURIComponent(filename)}`;

//         const iframe = document.createElement('iframe');
//         iframe.style.cssText = `width: 100%; height: 100vh; border: none; display: block;`;
        
//         $target.empty().append(iframe);
        
//         setTimeout(() => {
//             iframe.src = local_url;
//         }, 50);

//     } catch (err) {
//         console.error("PDF Error:", err);
//         $target.html(`<div style="padding:28px; color:red;">Error: ${err.message}</div>`);
//     }
// }