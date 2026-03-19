# Copyright (c) 2026, Gharieb Khalifa and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
import frappe
from frappe import _

class SigmaCoreCR(Document):
	def validate(self):
		if self.module_lead_approval and not self.has_role("SigmaCore Module Lead"):
			if not self._doc_before_save or not self._doc_before_save.module_lead_approval:
				frappe.throw(_("Only the Module Lead can check Lead Approved"))
		
		if self.modules_manager_approval and not self.has_role("SigmaCore Modules Manager"):
			if not self._doc_before_save or not self._doc_before_save.modules_manager_approval:
				frappe.throw(_("Only the Modules Manager can check Modules Manager Approved"))

	def has_role(self, role):
		return role in frappe.get_roles(frappe.session.user)