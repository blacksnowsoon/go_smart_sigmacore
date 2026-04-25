// Copyright (c) 2026, Gharieb Khalifa and contributors
// For license information, please see license.txt

// ── Get Preview Target ────────────────────────────────────────
/**
 * Get the target element for displaying previews
 * @param {Object} frm - The form object
 * @param {string} target - The field name to target
 * @returns {jQuery} The jQuery element to display content in
 */
function get_preview_target(frm, target) {
	const $field = $(frm.fields_dict[target].wrapper);
	return $field.find(".html-field-content").length
		? $field.find(".html-field-content")
		: $field;
}

// ── Loading state ────────────────────────────────────────
/**
 * Display a loading spinner with message in the target element
 * @param {jQuery} $target - The jQuery element to display the loader in
 */
function loading_state($target) {
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

// ── Generate PDF URL ────────────────────────────────────────
/**
 * Generate a URL for downloading PDF from frappe print format
 * @param {Object} frm - The form object
 * @param {string} format - The print format name
 * @param {Object} options - PDF generation options
 * @returns {string} The URL to the PDF
 */
function generate_pdf_url(frm, format, options) {
	return `/api/method/frappe.utils.print_format.download_pdf?` +
		`doctype=${encodeURIComponent(frm.doctype)}` +
		`&name=${encodeURIComponent(frm.doc.name)}` +
		`&format=${encodeURIComponent(format)}` +
		`&no_letterhead=1` +
		`&letterhead=${encodeURIComponent('No Letterhead')}` +
		`&options=${encodeURIComponent(JSON.stringify(options))}` +
		`&_=${new Date().getTime()}`;
}
