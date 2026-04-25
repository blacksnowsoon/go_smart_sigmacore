# Copyright (c) 2026, Gharieb Khalifa and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
import frappe
from frappe import _

class SigmaCoreCR(Document):
	


	def sync_assignment(self):
		"""Ensure ToDos are allocated to users in the 'analysts_by' child table.

		Behavior:
		- For each user in the 'analysts_by' child table, create or update a ToDo.
		- Delete any ToDo referencing this document that are not allocated to users
		  currently in the child table.
		- If the child table is empty, delete all associated ToDos.
		"""
		# Get list of users from analysts_by child table
		assigned_users = []
		if self.analysts_by:
			assigned_users = [row.analyst for row in self.analysts_by if row.analyst]

		# Find existing ToDos referencing this document
		existing = frappe.get_all('ToDo', filters={
			'reference_type': self.doctype,
			'reference_name': self.name
		}, fields=['name', 'allocated_to'])

		# Remove ToDos that are not for the assigned_users (or remove all if list is empty)
		for row in existing:
			if row.allocated_to not in assigned_users:
				frappe.delete_doc('ToDo', row.name, ignore_permissions=True)

		# Create or ensure ToDos exist for each assigned user
		for user in assigned_users:
			exists_for_user = frappe.db.exists('ToDo', {
				'reference_type': self.doctype,
				'reference_name': self.name,
				'allocated_to': user
			})

			if not exists_for_user:
				todo = frappe.get_doc({
					'doctype': 'ToDo',
					'description': self.title if self.title else f"SigmaCore CR: {self.name}",
					'allocated_to': user,
					'reference_type': self.doctype,
					'reference_name': self.name,
					'status': self.status if self.status == 'Closed' or self.status == 'Cancelled' else 'Open',
					'priority': self.priority,
					'assigned_by': frappe.session.user,
				})
				# Insert ignoring permissions so hooks can run in server context
				todo.insert(ignore_permissions=True)

	def after_insert(self):
		"""Called after document is inserted. Sync assignments with ToDos."""
		self.sync_assignment()

	def on_update(self):
		"""Called after document is updated. Sync assignments with ToDos."""
		self.sync_assignment()

@frappe.whitelist()
def get_cr_preview(docname):
	"""Render the CR preview Jinja template and return the HTML."""
	doc = frappe.get_doc("SigmaCore CR", docname)
	doc.check_permission("read")

	return frappe.render_template(
		"templates/sigmacore_cr_preview.html",
		{"doc": doc},
	)