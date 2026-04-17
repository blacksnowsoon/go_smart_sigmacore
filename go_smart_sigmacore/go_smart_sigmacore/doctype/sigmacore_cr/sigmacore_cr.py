# Copyright (c) 2026, Gharieb Khalifa and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
import frappe
from frappe import _

class SigmaCoreCR(Document):
	pass


@frappe.whitelist()
def get_cr_preview(docname):
	"""Render the CR preview Jinja template and return the HTML."""
	doc = frappe.get_doc("SigmaCore CR", docname)
	doc.check_permission("read")

	return frappe.render_template(
		"templates/sigmacore_cr_preview.html",
		{"doc": doc},
	)