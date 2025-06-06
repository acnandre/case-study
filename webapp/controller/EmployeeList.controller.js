sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator"
], function (Controller, Filter, FilterOperator, MessageToast, MessageBox, BusyIndicator) {
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
            const dDateOfHire = oView.byId("dateOfHireInput").getValue();
            const sCareerLevel = oView.byId("careerLevelInput").getValue();
            const sCurrentProject = oView.byId("currentProjectInput").getValue();

            /* Convert the date to proper format */
            if (dDateOfHire) {
            var dDateOfHireFormatted =  new Date(dDateOfHire.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              }));
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
        },
            /* Used to display message can be re used just call the function */ 

            fnDisplayMsg: function (sMsg) {
                MessageToast.show(sMsg);
            },

            /* Used to delete list of items in checkbox */ 
           _onPressDelete:function(){

            const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            let oModel = this.getOwnerComponent().getModel();
            let oView = this.getView().byId("tblEmployeeList");
            let aSelectedPaths = oView._aSelectedPaths;
                if (aSelectedPaths.length != "0") {
                    MessageBox.warning(oResourceBundle.getText("DeleteDialog.Content.Text"), {
                    actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (sAction) {
                        if (sAction == "YES") {
                            aSelectedPaths.forEach(function (sPath) {
                              BusyIndicator.show();
                                oModel.remove(sPath, {
                                      groupId: "grp1",
                                      success: function () {
                                        oView._aSelectedPaths.shift();
                                        BusyIndicator.show(0);
                                         setTimeout(function() {
                                              BusyIndicator.hide();
                                          }, 1000);
                                        }.bind(this),
                                        error: function (oError) {
                                            this.modelCallError(oError);
                                            MessageBox.error(oErrorText);
                                            setTimeout(function() {
                                                BusyIndicator.hide();
                                            }, 1000);
                                        }.bind(this)
                                    });
                                });
                                oModel.submitChanges({
                                    groupId: "grp1"
                                });
                            }
                        },
                        dependentOn: this.getView()
                    });
                } else {
                    let sMsg = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("Message.NoDataToBeDeleted");
                    this.fnDisplayMsg(sMsg);
                }
        },

    });
});
