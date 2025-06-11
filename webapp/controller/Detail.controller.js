sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], (BaseController, Filter, FilterOperator, JSONModel, MessageToast, History) => {
    "use strict";

    return BaseController.extend("sapips.training.employeeapp.controller.Detail", {
        onInit() {
            this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this._oRouter.getRoute("Detail").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched(oEvent) {
            const sEmployeeId = oEvent.getParameter("arguments").employeeId;
            const oView = this.getView();
            const oModel = oView.getModel();

            // Bind employee main data to the view
            oView.bindElement({
                path: `/Employees('${sEmployeeId}')`
            });

            // Read Skills with expanded details
            oModel.read("/Skills", {
                filters: [new Filter("EmployeeID", FilterOperator.EQ, sEmployeeId)],
                urlParameters: {
                    "$expand": "ProficiencyDetail,SkillDetail"
                },
                success: (oData) => {
                    const aSkills = oData.results || [];
                    const aProficiencies = aSkills
                        .filter(skill => skill.ProficiencyDetail)
                        .map(skill => skill.ProficiencyDetail);

                    oView.setModel(new JSONModel(aSkills), "skills");
                    oView.setModel(new JSONModel(aProficiencies), "proficiencies");
                },
                error: () => {
                    MessageToast.show("Failed to load skills data.");
                    oView.setModel(null, "skills");
                    oView.setModel(null, "proficiencies");
                }
            });
        },

        formatSkillsTitle: function (skillsArray) {
            if (!skillsArray || !Array.isArray(skillsArray)) {
                return this.getView().getModel("i18n").getResourceBundle().getText("skills") + " (0)";
            }
            const count = skillsArray.length;
            const bundle = this.getView().getModel("i18n").getResourceBundle();
            const skillsText = bundle.getText("skills");
            return `${skillsText} (${count})`;
        },

        onCancel() {
            this._oRouter.navTo("RouteEmployeeList");
        },
        onBack: function() {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            var oRouter = this.getOwnerComponent().getRouter();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                oRouter.navTo("RouteEmployeeList",{},true);
            }
        },

        onEdit: function() {
            //const oSelectedItem = oEvent.getSource();
            //const oContext = oSelectedItem.getBindingContext();
            //var sEmpText = this.getView().byID("valEmployeeID1");
            var sEmployeeID = this.getView().byId("valEmployeeID1").getText();            
            var oRouter = this.getOwnerComponent().getRouter();
    
            oRouter.navTo("RouteEditPage",{
                employeeId: sEmployeeID
            });
                
        }
    });
});
