sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller,JSONModel,Filter,FilterOperator,ODataModel,History,MessageToast,MessageBox) {
    "use strict";

    return Controller.extend("sapips.training.employeeapp.controller.EditPage", {
        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("RouteEditPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched(oEvent){
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
        onHandleLoadItems: function () {

            let oModelMockData = this.getOwnerComponent().getModel();
            this.getView().setModel(oModelMockData,"oModelJSON");
        },
        //For Checking of Age
        onLiveChange: function(oEvent){ 
            const regex = "^(?:[0-9]|[1-8][0-9]|90)$";
            let sValueState = "None";
            let oInputAge = this.getView().byId("idAge");

            if(oEvent.getParameter("value") === "" 
            || !oEvent.getParameter("value").match(regex)){
                
				sValueState = "Error";
				oInputAge.setValueState(sValueState);
                        }
                    else{
                oInputAge.setValueState(sValueState);
                    }
         },
         onOpenPopoverDialog: function () {
			if (!this.oDialog) {
				this.oDialog = this.loadFragment({
					name: "sapips.training.employeeapp.fragment.SkillAndProficienyFragment"
				});
			}
            
			this.oDialog.then(function(oDialog) {
                oDialog.open();
            });
		},
        onCloseDialog: function (){
            //Clear ComboBox
            let oComboSkill = this.getView().byId("idComboBoxSkill");
            let oComboProf = this.getView().byId("idComboBoxProficiency");
            this.fnClearComboBox(oComboProf,oComboSkill);

            //Closes dialog
            this.getView().byId("idSkillProfDialog").close();
        },
        onSaveDialog: function (){
            //Save Skills
            let oComboSkill = this.getView().byId("idComboBoxSkill");
            let oComboProf = this.getView().byId("idComboBoxProficiency");
            let sSkillPick = oComboSkill.getValue();
            let sSkillKey = oComboSkill.getSelectedKey();
            let sSkillProf = oComboProf.getValue();
            let sProfKey = oComboProf.getSelectedKey();

            //Clear ComboBox
            this.fnClearComboBox(oComboProf,oComboSkill);

            let oModel = this.getView().getModel("oModelSkillProf");
            let aSkillProf = oModel.getProperty("/");

            //Push Data to Model Table
            if (aSkillProf.length == undefined) {
                let oaSkillProf = [{
                    "SkillName": sSkillPick,
                    "ProficiencyLevel": sSkillProf,
                    "SkillID": sSkillKey,
                    "ProficiencyID": sProfKey
                }];

                oModel.setData(oaSkillProf);
                this.getView().setModel(oModel, "oModelSkillProf");
            }
            else {

                let oSkillProf = {
                    "SkillName": sSkillPick,
                    "ProficiencyLevel": sSkillProf,
                    "SkillID": sSkillKey,
                    "ProficiencyID": sProfKey
                }

                //Check if skill is already existing before push
                const sText = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("checkSkill");
                let sExists = false;
                for(let i = 0; i < aSkillProf.length; i++) {
                    if (sSkillKey==aSkillProf[i].SkillID) {
                        this.fnDisplayMsg(sText);
                        sExists=true;
                        break;
                    };
                    //Check if no selection for Proficiency
                    if (sSkillProf=="") {
                        const sText2 = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("checkProf");
                        this.fnDisplayMsg(sText2);
                        sExists=true;
                        break;
                    }
                    //Check if no selection for Skill
                    if (sSkillPick=="") {
                        const sText2 = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("checkSkill");
                        this.fnDisplayMsg(sText2);
                        sExists=true;
                        break;
                    }
                };
                //Exit if true
                if (sExists==true) {
                    return;
                };

                aSkillProf.push(oSkillProf);
                oModel.setProperty("/",aSkillProf);
            }

            this.getView().byId("idSkillProfDialog").close();
            // this.getView().setModel(oModel, "date");
            
        },
         onLiveChangeEmployee: function(){
            let oInputFirstNm = this.getView().byId("idInputNameE");
            let oInputLastNm = this.getView().byId("idLastNameE");
            let sInputFirstNm = oInputFirstNm.getValue();
            let sInputLastNm = oInputLastNm.getValue();
            //let sInpDate = this.getView().byId("idDatePicker").getValue();
            /*
            let oCurrDate = this.getView().byId("idDatePickerE").getValue();
            let nDay = oCurrDate.getProperty("day");
            let sDay = nDay.toString();
            let nMonth = oCurrDate.getMonth();
            let sMonth = nMonth.toString();*/

            //Check if First Name contains alphabet only
            if (this.fnValidateInput(sInputFirstNm) == false) {
                oInputFirstNm.setValueState("Error");
                return;
            }
            else {
                oInputFirstNm.setValueState("None");
            }

            //Check if Last Name contains alphabet only
            if (this.fnValidateInput(sInputLastNm) == false) {
                oInputLastNm.setValueState("Error");
                return;
            }
            else {
                oInputLastNm.setValueState("None");
            }

            /*/Check if Single Day and/or Month
            if (sDay.length == 1) {
                sDay = "0" + sDay;
            };
            if (sMonth.length == 1) {
                sMonth = "0" + sMonth;
            };*/

            let sFullName = sInputLastNm + sInputFirstNm;
            // Delete spaces and limit Fullname for other details
            sFullName = sFullName.replace(/\s+/g, '');
            sFullName = sFullName.substring(0,34);

         },
         // Name Validation
         fnValidateInput: function(sInput) {
            // const input = oEvent.getSource().getValue();
            let regexInp = "^[A-Za-z ]*$";
            if (sInput.match(regexInp) != null &&
                sInput.trim() != "") {  //for only space
                return true;
            } else {
                return false;
            }
        },
        onHandleComboChange: function (oEvent) {
			let oValidatedComboBox = oEvent.getSource(),
				sSelectedKey = oValidatedComboBox.getSelectedKey(),
				sValue = oValidatedComboBox.getValue();

			if (!sSelectedKey && sValue) {
				oValidatedComboBox.setValueState("Error");
				oValidatedComboBox.setValueStateText("Please enter a valid item!");
			} else {
				oValidatedComboBox.setValueState("None");
			}
		},
        fnClearComboBox: function(oCombo1,oCombo2) {

            oCombo1.setSelectedKey(""); 
            oCombo1.setValue("");  

            oCombo2.setSelectedKey(""); 
            oCombo2.setValue("");  
        }, 
        
        /*
        fnClearCreatePage: function() {
            //Clear Employee ID
            this.getView().byId("idEmployeeIDE").setValue("");

            //Clear First Name
            this.getView().byId("idInputNameE").setValue("");

            //Clear Last Name
            this.getView().byId("idLastNameE").setValue("");

            //Clear Age
            this.getView().byId("idAgeE").setValue("");

            //Set Default Date
            let oDate = new Date();
            const oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "MMMM d, yyyy" });
            let sFormattedDate = oDateFormat.format(oDate);
            this.getView().byId("idDatePickerE").setValue(sFormattedDate);

            //Clear Career Level
            this.getView().byId("idComboBoxCareersE").setValue("");

            //Clear Project
            this.getView().byId("idComboBoxProjectsE").setValue("");

            //Clear Skills
            let oModel = this.getView().getModel("oModelSkillProf");
            let aArray = oModel.getProperty("/");
            //Clear Array
            aArray =[];
            oModel.setProperty("/",aArray);

        },*/
        onEditCancel: function() {
            //this.fnClearCreatePage();
            const oRouter = this.getOwnerComponent().getRouter();
            const oHistory = History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                oRouter.navTo("RouteEditPage");
            }
        },
        onEditSave: function() {
            //Check if required fields are entered
            const sText = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("needRequired");
            ////EmployeeID
            const sEmpyloyeeID = this.getView().byId("idEmployeeIDE").getValue();
            if (this.fnCheckValueAndState("idEmployeeIDE") == false) {
                this.fnDisplayMsg(sText)
                return;
            };
            ////First Name
            const sFirstName = this.getView().byId("idInputNameE").getValue();
            if (this.fnCheckValueAndState("idInputNameE") == false) {
                this.fnDisplayMsg(sText)
                return;
            };
            ////Last Name
            const sLastName = this.getView().byId("idLastNameE").getValue();
            if (this.fnCheckValueAndState("idLastNameE") == false) {
                this.fnDisplayMsg(sText)
                return;
            };
            ////Age
            const nAge = this.getView().byId("idAgeE").getValue();
            if (this.fnCheckValueAndState("idAgeE") == false) {
                this.fnDisplayMsg(sText)
                return;
            };
            ////Date
            const sDate = this.getView().byId("idDatePickerE").getValue();
            if (this.fnCheckValueAndState("idDatePickerE") == false) {
                this.fnDisplayMsg(sText)
                return;
            };
            ////Careers
            const sCareers = this.getView().byId("idComboBoxCareersE").getValue();
            if (this.fnCheckValueAndState("idComboBoxCareersE") == false) {
                this.fnDisplayMsg(sText)
                return;
            };
            ////Projects
            const sProjects = this.getView().byId("idComboBoxProjectsE").getValue();
            if (this.fnCheckValueAndState("idComboBoxProjectsE") == false) {
                this.fnDisplayMsg(sText)
                return;
            };
            /*/Check if there is at least 1 skill
            let oModel = this.getView().getModel();
            let aSkillProf = oModel.getProperty("/Skills");
            debugger;

            if (aSkillProf.length == undefined || aSkillProf.length == null) {
                this.fnDisplayMsg("Add at least 1 skill");
                return;
            }
            else {
                //Get Skills Property
                let oMainModel = this.getView().getModel();

                //Ready Skills Array 
                for (let i = 0; i < aSkillProf.length; i++) {
                    
                    // let aSkills = oMainModel.getProperty("/Skills");

                    let oNewSkill = {
                        "EmployeeID": sEmpyloyeeID,
                        "SkillName": aSkillProf[i].SkillName,
                        "ProficiencyLevel": aSkillProf[i].ProficiencyLevel,
                        "SkillID": aSkillProf[i].SkillID,
                        "ProficiencyID": aSkillProf[i].ProficiencyID
                    };

                    oMainModel.create("/Skills",oNewSkill,{
                        success: function(data){
        
                        },
                        error: function(data){
        
                        } 
                    });

                    // //Push to Skills Table
                    // aSkills.push(oNewSkill);
                    // oMainModel.setProperty("/Skills",aSkills);
                    
                };
            };*/
            //Save to Employees
            let oNewEmployee = {
                "FirstName": sFirstName,
                "LastName": sLastName,
                "Age": nAge,
                "DateHire": sDate,
                "CareerLevel": sCareers,
                "CurrentProject": sProjects,
                "EmployeeID": sEmpyloyeeID
            };
            console.log("Create", oNewEmployee );
            //Check if Emp ID existing already
            let oMainModel2 = this.getOwnerComponent().getModel();
            let sPath = `/Employees('${sEmpyloyeeID}')`;


            /*var oView = this.getView();
            var oModel = this.getOwnerComponent().getModel("oModelJSON");
            var oUpdatedData = oView.getModel("EmpEditModel").getData();
            var sEmpID = oUpdatedData.EmployeeID;
            var sEmpPath = `/Employees('${sEmpID}')`;*/
            
            if (oMainModel2.getData(sPath)!=undefined) {
                oMainModel2.update("/Employees",oNewEmployee,{
                    success: function(data){
                        fnDisplayMsg("Success")

                    },
                    error: function(data){
                        fnDisplayMsg("Error")

                    } 
                });
            }

            
            
            //Route back to Employees           
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("Detail",{
                employeeId: sEmpyloyeeID
            });
        },
        fnDisplayMsg: function (sMsg) {
            MessageToast.show(sMsg);
        },
        fnCheckValueAndState(sID) {
            let sValueState = this.getView().byId(sID).getValueState();
            if (sValueState == "Error") {
                return false;
            }
            else {
                let sValue = this.getView().byId(sID).getValue();
                if (sValue.trim() == "") {
                    return false;
                }
                else {
                    return true;
                }
            }
        },
        onSkillDelete: function() {
            let oOSkillModel = this.getOwnerComponent().getModel("oModelSkillProf");
            let aSkillProf = oOSkillModel.getProperty("/");
            let oView = this.getView().byId("idSkillsTableE");
            let aSelectedPaths = oView._aSelectedPaths;
            let bFlag = false;
            let nCounter = 1;
            //Skill Validation
            if (aSelectedPaths.length != "0") {
                aSelectedPaths.forEach(function (sPath) {
                    let iIndex = parseInt(sPath.split("/").pop(), 10);

                    if (bFlag==true) {
                        iIndex = iIndex - nCounter;
                        nCounter = nCounter + 1;
                    }

                    //Remove the item
                    aSkillProf.splice(iIndex, 1);
                    
                    bFlag=true;
            })
                bFlag=false;
                //Update the Model
                oOSkillModel.setProperty("/",aSkillProf);

                //Clear Selection
                oView.removeSelections(true,false);
            }
            else {
                let sMsg = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("noSkillToBeDeleted");
                this.fnDisplayMsg(sMsg);
            }
        }
    });
});