# Copyright (c) 2026, Gharieb Khalifa and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class SigmaCoreBugReport(Document):
	pass


@frappe.whitelist()
def get_bug_report_preview(docname):
	"""Render the Bug Report preview Jinja template and return the HTML."""
	doc = frappe.get_doc("SigmaCore Bug Report", docname)
	doc.check_permission("read")

	return frappe.render_template(
		"templates/sigmacore_bug_report_preview.html",
		{"doc": doc},
	)
