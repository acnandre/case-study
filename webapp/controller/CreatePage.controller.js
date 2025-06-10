sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller,JSONModel,ODataModel,History,MessageToast,MessageBox) {
    "use strict";

    return Controller.extend("sapips.training.employeeapp.controller.CreatePage", {
        onInit: function () {
        // for Date Model
            let oDate = new Date();
            let dMaxYear = oDate.getFullYear() + 1;
            let oModel = new JSONModel({
                dDefaultDate : oDate,
                dMaxDate : new Date(dMaxYear, oDate.getMonth(), ( oDate.getDate() ) )
            });
            this.getView().setModel(oModel, "date");
          //  this.onLiveChangeEmployee();
          //For Skill Model
        // var oModelMock = new ODataModel("/localService/mainService");
		// this.getView().setModel(oModelMock);
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
            //.bind(this));
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
            let oInputEmpId = this.getView().byId("idEmployeeID");
            let oInputFirstNm = this.getView().byId("idInputName");
            let oInputLastNm = this.getView().byId("idLastName");
            let sInputFirstNm = oInputFirstNm.getValue();
            let sInputLastNm = oInputLastNm.getValue();
            //let sInpDate = this.getView().byId("idDatePicker").getValue();
            let oCurrDate = this.getView().byId("idDatePicker").getDateValue();
            let nDay = oCurrDate.getDate();
            let sDay = nDay.toString();
            let nMonth = oCurrDate.getMonth();
            let sMonth = nMonth.toString();

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

            //Check if Single Day and/or Month
            if (sDay.length == 1) {
                sDay = "0" + sDay;
            };
            if (sMonth.length == 1) {
                sMonth = "0" + sMonth;
            };

            let sFullName = sInputLastNm + sInputFirstNm;
            // Delete spaces and limit Fullname for other details
            sFullName = sFullName.replace(/\s+/g, '');
            sFullName = sFullName.substring(0,34);

            let sEmpyloyeeID = "EmployeeID" + sFullName + sDay + sMonth;
            //Set New Value
            oInputEmpId.setValue(sEmpyloyeeID);

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
        fnClearCreatePage: function() {
            //Clear Employee ID
            this.getView().byId("idEmployeeID").setValue("");

            //Clear First Name
            this.getView().byId("idInputName").setValue("");

            //Clear Last Name
            this.getView().byId("idLastName").setValue("");

            //Clear Age
            this.getView().byId("idAge").setValue("");

            //Set Default Date
            let oDate = new Date();
            const oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "MM.dd.yyyy" });
            let sFormattedDate = oDateFormat.format(oDate);
            this.getView().byId("idDatePicker").setValue(sFormattedDate);

            //Clear Career Level
            this.getView().byId("idComboBoxCareers").setValue("");

            //Clear Project
            this.getView().byId("idComboBoxProjects").setValue("");

            //Clear Skills
            let oModel = this.getView().getModel("oModelSkillProf");
            let aArray = oModel.getProperty("/");
            //Clear Array
            aArray =[];
            oModel.setProperty("/",aArray);

        },
        onCreateCancel: function() {
            this.fnClearCreatePage();
            const oRouter = this.getOwnerComponent().getRouter();
            // oRouter.navTo("RouteEmployeeList");
            const oHistory = History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                oRouter.navTo("RouteEmployeeList");
            }
        },
        onCreateSave: function() {
            //Check if required fields are entered
            const sText = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("needRequired");
            ////EmployeeID
            const sEmpyloyeeID = this.getView().byId("idEmployeeID").getValue();
            if (this.fnCheckValueAndState("idEmployeeID") == false) {
                this.fnDisplayMsg(sText)
                return;
            };
            ////First Name
            const sFirstName = this.getView().byId("idInputName").getValue();
            if (this.fnCheckValueAndState("idInputName") == false) {
                this.fnDisplayMsg(sText)
                return;
            };
            ////Last Name
            const sLastName = this.getView().byId("idLastName").getValue();
            if (this.fnCheckValueAndState("idLastName") == false) {
                this.fnDisplayMsg(sText)
                return;
            };
            ////Age
            const nAge = this.getView().byId("idAge").getValue();
            if (this.fnCheckValueAndState("idAge") == false) {
                this.fnDisplayMsg(sText)
                return;
            };
            ////Date
            const sDate = this.getView().byId("idDatePicker").getValue();
            if (this.fnCheckValueAndState("idDatePicker") == false) {
                this.fnDisplayMsg(sText)
                return;
            };
            ////Careers
            const sCareers = this.getView().byId("idComboBoxCareers").getValue();
            if (this.fnCheckValueAndState("idComboBoxCareers") == false) {
                this.fnDisplayMsg(sText)
                return;
            };
            ////Projects
            const sProjects = this.getView().byId("idComboBoxProjects").getValue();
            if (this.fnCheckValueAndState("idComboBoxProjects") == false) {
                this.fnDisplayMsg(sText)
                return;
            };
            //Check if there is at least 1 skill
            let oModel = this.getView().getModel("oModelSkillProf");
            let aSkillProf = oModel.getProperty("/");

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
            };

            //Convert date to proper format (Andre)
            const oDate = new Date(sDate);
        
            const sFormattedDate = [
                String(oDate.getMonth() + 1).padStart(2, '0'), // MM
                String(oDate.getDate()).padStart(2, '0'),      // DD
                oDate.getFullYear()                            // YYYY
            ].join('/');

            //Save to Employees
            let oNewEmployee = {
                "FirstName": sFirstName,
                "LastName": sLastName,
                "Age": nAge,
                "DateHire": sFormattedDate,
                "CareerLevel": sCareers,
                "CurrentProject": sProjects,
                "EmployeeID": sEmpyloyeeID
            };
            
            //Check if Emp ID existing already
            let oMainModel2 = this.getOwnerComponent().getModel();
            let sPath = "/Employees('" + sEmpyloyeeID + "')";
            let sText3 = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("employeeExisting");
            if (oMainModel2.getData(sPath)!=undefined) {
                this.fnDisplayMsg(sText3);
                return;
            }

            oMainModel2.create("/Employees",oNewEmployee,{
                success: function(data){
                },
                error: function(data){

                } 
            });
            
            //Route back to Employees
            //Clear Create page then go back to Employees
            this.fnClearCreatePage();
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteEmployeeList");
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
            let oView = this.getView().byId("idSkillsTable");
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