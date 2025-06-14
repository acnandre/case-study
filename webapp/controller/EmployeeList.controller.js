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
            this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
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
            let dDateOfHireFormatted;

            /* Convert the date to proper format */
            if (dDateOfHire) {
                const oDate = new Date(dDateOfHire);
            
                const sFormattedDate = [
                    String(oDate.getMonth() + 1).padStart(2, '0'), // MM
                    String(oDate.getDate()).padStart(2, '0'),      // DD
                    oDate.getFullYear()                            // YYYY
                ].join('/');
            
                dDateOfHireFormatted = sFormattedDate;
            }
            

            const aFilters = [];
            
            /* If filter input is not empty, create filter so we can apply later */
            if (sEmpId) {
                aFilters.push(new Filter("EmployeeID", FilterOperator.Contains, sEmpId));
            }
            if (sFirstName) {
                aFilters.push(new Filter("tolower(${FirstName})", FilterOperator.Contains, sFirstName.toLowerCase()));
            }
            if (sLastName) {
                aFilters.push(new Filter("tolower(${LastName})", FilterOperator.Contains, sLastName.toLowerCase()));
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
                aFilters.push(new Filter("tolower(${CurrentProject})", FilterOperator.Contains, sCurrentProject.toLowerCase()));
            }

            /* Apply filters to the table */
            const oTable = oView.byId("tblEmployeeList");
            const oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);
        },

        onPressEmployee: function (oEvent) {
        const oSelectedItem = oEvent.getSource();
        const oContext = oSelectedItem.getBindingContext();
        const sEmployeeID = oContext.getProperty("EmployeeID");
    
        this._oRouter.navTo("Detail", {
            employeeId: sEmployeeID
        });
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
                                            BusyIndicator.show(0);
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
                        }
                    });
                } else {
                    let sMsg = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("Message.NoDataToBeDeleted");
                    this.fnDisplayMsg(sMsg);
                }
        },

        onPressAdd: function(oEvent) {
            const oRouter = this.getOwnerComponent().getRouter();
            //let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            //Navigate to Create page
            oRouter.navTo("RouteCreatePage");
        }


    });
});
