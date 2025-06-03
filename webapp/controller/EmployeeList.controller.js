sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("sapips.training.employeeapp.controller.EmployeeList", {
        onInit: function () {
        },

        onSearch: function () {
            const oView = this.getView();

            /* Collect all input values */
            const sEmpId = oView.byId("empIdInput").getValue();
            const sFirstName = oView.byId("firstNameInput").getValue();
            const sLastName = oView.byId("lastNameInput").getValue();
            const sAge = oView.byId("ageInput").getValue();
            const dDateOfHire = new Date(oView.byId("dateOfHireInput").getValue());
            const sCareerLevel = oView.byId("careerLevelInput").getValue();
            const sCurrentProject = oView.byId("currentProjectInput").getValue();

            /* Convert the date to proper format */
            if (dDateOfHire) {
            var dDateOfHireFormatted = dDateOfHire.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              });
              console.log(dDateOfHireFormatted);
            }

            const aFilters = [];
            
            /* If filter input is not empty, create filter so we can apply later */
            if (sEmpId) {
                aFilters.push(new Filter("EmployeeID", FilterOperator.Contains, sEmpId));
            }
            if (sFirstName) {
                aFilters.push(new Filter("FirstName", FilterOperator.Contains, sFirstName));
            }
            if (sLastName) {
                aFilters.push(new Filter("LastName", FilterOperator.Contains, sLastName));
            }
            if (sAge) {
                aFilters.push(new Filter("Age", FilterOperator.EQ, parseInt(sAge)));
            }
            if (dDateOfHire) {
                aFilters.push(new Filter("DateHire", FilterOperator.EQ, dDateOfHireFormatted));
            }
            if (sCareerLevel) {
                aFilters.push(new Filter("CareerLevel", FilterOperator.Contains, parseInt(sCareerLevel)));
            }
            if (sCurrentProject) {
                aFilters.push(new Filter("CurrentProject", FilterOperator.Contains, sCurrentProject));
            }

            /* Apply filters to the table */
            const oTable = oView.byId("tblEmployeeList");
            const oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);
        }
    });
});
