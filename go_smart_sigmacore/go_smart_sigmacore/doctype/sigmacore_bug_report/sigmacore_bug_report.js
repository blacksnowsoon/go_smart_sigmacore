// Copyright (c) 2026, Gharieb Khalifa and contributors
// For license information, please see license.txt

frappe.ui.form.on("SigmaCore Bug Report", {
	onload(frm) {
        //filter level 1 
        frm.set_query('module_name', 'impact_area', function(doc, cdt, cdn) {
            let row = locals[cdt][cdn];
            return {
                'filters': {
                    'is_group': '1',
                    'hierarchy_level': 'Module'
                }
            };
        });
        //filter level 2
        frm.set_query('section', 'impact_area', function(doc, cdt, cdn) {
            let row = locals[cdt][cdn];
            
            return {
                'filters' : {
                    'is_group': '1',
                    'parent_sigmacore_module': row.module_name,
                    'hierarchy_level': 'Section'
                }
            };
        });
        //filter level 3
        frm.set_query('target', 'impact_area', function(doc, cdt, cdn) {
            let row = locals[cdt][cdn];
            
            return {
                'filters' : {
                    'is_group': '0',
                    'parent_sigmacore_module': row.section,
                    // 'hierarchy_level': 'Module'
                }
            };
        });
        
    },
	refresh(frm) {
		
		frm.fields_dict["report_preview"].tab.tab_link.on("click", () => {
			render_bug_report_preview(frm);
		});
		frm.fields_dict["pdf_preview"].tab.tab_link.on("click", () => {
			render_pdf_view(frm)
		})
		if (frm.is_new()) {
            
            frm.fields_dict.impact_area.grid.update_docfield_property(
                "section", "read_only", 1
            );
             frm.fields_dict.impact_area.grid.update_docfield_property(
                "target", "read_only", 1
            );
        } else {
			
		}
	},
});



frappe.ui.form.on("SigmaCore Module Scope Child Table", {
    impact_area_add(frm, cdt, ndt) {
        frm.fields_dict.impact_area.grid.update_docfield_property(
            "section", "read_only", 1
        );
         frm.fields_dict.impact_area.grid.update_docfield_property(
            "target", "read_only", 1
        );
        
      frm.refresh_field('impact_area');
    },
	module_name: function(frm,cdt, ndt) {
	    const row = locals[cdt][ndt];
	    
	    if (!row.module_name && (row.section || row.target)){
	        row.section = "";
	        row.target = "";
	    }
	    
	    frm.fields_dict.impact_area.grid.update_docfield_property(
            "section", "read_only", !row.module_name ? 1 : 0
        );
	    frm.fields_dict.impact_area.grid.update_docfield_property(
            "target", "read_only", !row.module_name ? 1 : 0
        );
	    frm.refresh_field('impact_area');
	},
	section: function(frm,cdt, ndt) {
	    const row = locals[cdt][ndt];
	   if (!row.section) row.target = "";
	   
	   frm.fields_dict.imapct_area.grid.update_docfield_property(
            "target", "read_only", !row.section ? 1 : 0
        );
	    frm.refresh_field('impact_area');
	}
});

function childTableAccessCondations(frm) {
    // map each row
        frm.fields_dict.impact_area.grid.grid_rows.map(row => {
            // map the columns of the row
            for (let [key, value] of Object.entries(row.columns)) {
                // map the meta data of each column or cell 
                for (let [k, v] of Object.entries(value)) {
                    // the field property is added as soon as you toch the row as an object 
                    // if it has that property search the value prop to check if empty or not.
                    // from the df prop you can change the field properties(read_only, reqd, ...etc)
                    // here i want to disable the section field if the module_name is empty
                    if(k === "field" && key === "module_name") {
                        if(v === undefined || v === "") {
                            row.columns.section.df.read_only = 1;
                        } else {
                            row.columns.section.df.read_only = 0;
                        }
                        
                    } else {
                         row.columns.section.df.read_only = 1;
                    }
                    
                }
                
            }
            
        })
}


function render_bug_report_preview(frm) {
	if (frm.doc.__islocal) {
		get_preview_target(frm, "report_preview").html(
			`<div style="padding:40px 28px;color:var(--text-muted,#94a3b8);font-size:0.9rem;">
				Save the document first to see the preview.
			</div>`
		);
		return;
	}

	const $target = get_preview_target(frm, "report_preview");
	// ── Loading state ────────────────────────────────────────
	loading_state($target)

	// ── Fetch rendered HTML from server ──────────────────────
	frappe.call({
		method: "go_smart_sigmacore.go_smart_sigmacore.doctype.sigmacore_bug_report.sigmacore_bug_report.get_bug_report_preview",
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
		get_preview_target(frm, 'pdf_preview').html(
			`<div style="padding:40px 28px;color:var(--text-muted,#94a3b8);font-size:0.9rem;">
				Save the document first to see the PDF.
			</div>`
		);
		return;
	}
	
	const $target = get_preview_target(frm, 'pdf_preview')
	// ── Loading state ────────────────────────────────────────
	loading_state($target)
	
	// ── generate PDF ────────────────────────────────────────
	const format = "SigmaCore Bug Builder"
	const options = {
		"page-size": "A4",
		"title": frm.doc.name,
		"author": "Gosmart-SigmaCore",
		"name": frm.doc.name,
		"margin": "2"
		
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
