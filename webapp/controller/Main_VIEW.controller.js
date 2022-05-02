sap.ui.define([
	'sap/ui/core/Fragment',
	'sap/ui/model/Filter',
	'sap/m/Token',
	'sap/ui/model/FilterOperator',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/ValueState",
	"com/aymax/apave/sd/BureauOrdre/BureauOrdreCreate/model/formatter",
	"sap/m/MessagePopover",
	"sap/m/MessageItem",
	"sap/ui/core/Core",
	"sap/ui/core/message/Message",
	"sap/ui/core/MessageType",
	"./Utils/MessagesPopOverHandler",
	"./Utils/pjCreate"
], function (Fragment, Filter, Token, FilterOperator, Controller, JSONModel, MessageToast, MessageBox, ValueState, formatter,
	MessagePopover, MessageItem, Core, Message, MessageType, MessagePopOverHandler, pjCreate) {
	"use strict";

	return Controller.extend("com.aymax.apave.sd.BureauOrdre.BureauOrdreCreate.controller.Main_VIEW", {
		formatter: formatter,
		MsgPopOverHdler: MessagePopOverHandler,
		pjCreateHdler: pjCreate,
		onInit: function () {

			//	this.getView().getModel("CreateModel").setProperty("/ZSTATDE", "Crée");
			this._wizard = this.byId("CreateProductWizard");
			this._oNavContainer = this.byId("wizardNavContainer");
			this._oWizardContentPage = this.byId("wizardContentPage");
			this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

			this._MessageManager = Core.getMessageManager();
			this.getView().setModel(this._MessageManager.getMessageModel(), "Messages");

			/*PJ Uploader init*/
			this.getView().byId("pjUploader").setUploadUrl("/sap/opu/odata/sap/ZSDGW_OFFICE_ORDER_APP_SRV/Pieces_jointes");
			this.getView().byId("D1").setDateValue(new Date());
		},
		onAfterRendering: function () {
			var that = this;
			/*Some PJ uploader custom stuff*/
			this.getView().byId("pjUploader").getToolbar().getTitleControl().setBusy(true);
			this.getView().byId("pjUploader").getToolbar().getTitleControl().setText(this.getOwnerComponent().getModel("i18n").getProperty(
				"Coverphoto"));
			this.getView().byId("pjUploader").getToolbar().getTitleControl().setBusy(false);
			this.getView().byId("CreateProductWizard")._getNextButton().setText(this.getOwnerComponent().getModel("i18n").getProperty(
				"AffecterServices"));
			//Handle onAfaterRedering of the service table
			this.oView.byId('idServiceTable').addEventDelegate({
				onAfterRendering: function (evt) {
					var aFilter = "";
					var oList = "";
					//get Table Items
					var aItems = that.oView.byId('idServiceTable').getItems();
					for (var i = 0; i < aItems.length; i++) {
						//get the service of the Item and add it to the filter
						var oService = aItems[i].getBindingContext().getProperty("Zcserv");
						aFilter = [new sap.ui.model.Filter("Zcserv", sap.ui.model.FilterOperator.EQ, oService)];
						//get the list of the employees
						oList = aItems[i].getCells()[3];
						//Filter on the list
						var oBinding = oList.getBinding("items");
						oBinding.filter(aFilter);
					}
				}
			});
		},

		//
		handleWizardCreate: function (evt) {

			/*Checking if there is errors with one function*/
			if (this.checkInputsErrors()) {
				this.getView().byId("messagePopoverBtn").setBusy(true);
				setTimeout(function () {
					this.getView().byId("messagePopoverBtn").firePress();
				}.bind(this), 100);
				this.getView().byId("messagePopoverBtn").setBusy(false);

			} else {

				/*If Yes ==> Open the msgPopver*/
				/*If not proced to the save action*/

				var create = this.getView().getModel("CreateModel").getData();
				var obj = {};

				obj = create;
				var exp = this.getView().byId("Ex").getValue();
				var oPiloteServiceSelected = false;
				var ZservPilote = "";
				var ZlibServPilote = "";
				if (create.Zlibcat !== "" && create.ZlibNr !== "" && create.Zscatref !== "" && exp !== "") {
					var oTable = this.getView().byId("idServiceTable");
					for (var i = 0; i < oTable.getItems().length; i++) {
						var oContext = oTable.getItems()[i].getBindingContext().getObject();
						if (oContext.Ztypepilote) {
							i = oTable.getItems().length;
							oPiloteServiceSelected = true;
							ZservPilote = oContext.Zcserv;
							ZlibServPilote = oContext.Zlibserv;

						}
					}
					/*if (!oPiloteServiceSelected) {
						var oDialog = new sap.m.Dialog({
							type: sap.m.DialogType.Message,
							title: "Erreur",
							state: ValueState.Error,
							content: new sap.m.Text({
								text: "Veuillez SVP Selectionner au moins un Service Pilote"
							}),
							beginButton: new sap.m.Button({
								text: "OK",
								press: function () {
									oDialog.close();
								}.bind(this)
							})
						});
						oDialog.open();

					}*/
				}
				/*else {
					var oDialog1 = new sap.m.Dialog({
						type: sap.m.DialogType.Message,
						title: "Erreur",
						state: ValueState.Error,
						content: new sap.m.Text({
							text: "Veuillez SVP Remplir tous les champs Obligatoire"
						}),
						beginButton: new sap.m.Button({

							text: "OK",
							press: function () {
								oDialog1.close();
							}
						})
					});
					oDialog1.open();

				}*/
				if (oPiloteServiceSelected) {
					obj.Zdc = formatter.toBoolean(create.Zdc);
					obj.Zdi = formatter.toBoolean(create.Zdi);
					obj.Zdu = formatter.toBoolean(create.Zdu);

					create.Zdar = formatter.dateFormatter(this.getView().byId("D1").getDateValue());
					// create.Zdem = formatter.dateFormatter(this.getView().byId("D2").getDateValue());
					create.Zdec = formatter.dateFormatter(this.getView().byId("D3").getDateValue());
					create.Zdexp = formatter.dateFormatter(this.getView().byId("D4").getDateValue());
					create.Zcserv = ZservPilote;
					create.Zlibserv = ZlibServPilote;
					create.Zstatid = "001";
					create.Zstatde = "Crée";
					obj.Zlibclient = this.getView().byId("Ex").getValue();
					var today = new Date().toLocaleString();
					create.DateCre = today.substr(6, 4) + today.substr(3, 2) +
						today.substr(0, 2);
					//	create.DateCre = parseInt(create.DateCre);
					var oModel = this.getView().getModel();
					this.getView().setBusy(true);
					oModel.create("/Document_entrantSet", obj, {
						success: function (oData, oResponse) {

							/*PJ HANDLING*/
							this.pjCreateHdler.uploadFilesFromPC.apply(this, [oData.Zrefde]);

							var oTable = this.getView().byId("idServiceTable");
							for (var i = 0; i < oTable.getItems().length; i++) {
								var oContext = oTable.getItems()[i].getBindingContext().getObject();
								//if service pilote or selection is checked we create the entity
								oContext.Zrefde = oData.Zrefde;
								var oDoc_ser = {};
								oDoc_ser.Zrefde = oData.Zrefde;
								oDoc_ser.Ztypepilote = oContext.Ztypepilote;
								oDoc_ser.Ztypeselection = oContext.Ztypeselection;
								oDoc_ser.Zcserv = oContext.Zcserv;
								oDoc_ser.Zlibserv = oContext.Zlibserv;
								oDoc_ser.Zemployee = (oContext.Zemployee).filter(e => e).join(","); //  .filter(e ==> e) to remove empty element
								if (oContext.Ztypepilote || oContext.Ztypeselection) {
									oModel.create("/DOC_SERVICESSet", oDoc_ser, {
										success: function (oData, oResponse) {

											/*Refreshing the errors Msg + Adding a creation succes msg with id of the new doc created*/
											this.MsgPopOverHdler.removeAllMsgsByType.apply(this, [MessageType.Error]);
											this.addCreatedDocSuccesMsg(oDoc_ser.Zrefde);

											this.getView().getModel("CreateModel").setData({});

											oModel.resetChanges();
											this.getView().setBusy(false);
										}.bind(this),
										error: function (error) {
											this.getView().setBusy(false);
										}.bind(this)
									});
								}
							}
						}.bind(this),
						error: function (oError) {
							this.getView().setBusy(false);
						}.bind(this)
					});

				}
			}
		},

		//on change categorie we get List of sous categorie et nature d'objet
		onChangeCategorieFilter: function (evt) {
			var ssCategorie = this.getView().byId("subCategoryId");
			var categoryId = evt.getSource().getSelectedKey();

			ssCategorie.setSelectedKey();
			this.getOwnerComponent().getModel("SubcategoryModel").setData(null);

			this.getOwnerComponent().getModel().read("/CATEGORYSet('" + categoryId + "')/SUB_CATEGORYSet", {
				success: function (oData, response) {
					this.getView().byId("subCategoryId").setEnabled(true);
					this.getOwnerComponent().getModel("SubcategoryModel").setData(oData.results);
					ssCategorie.setModel(this.getOwnerComponent().getModel("SubcategoryModel"));
					//  ssTypeObject.setModel(this.getOwnerComponent().getModel("TypeObjectModel"));
					ssCategorie.bindAggregation("items", "/",
						function (id, context) {
							var oItemSelectTemplate = new sap.ui.core.Item({
								key: encodeURI(context.getProperty("Scatref")),
								text: context.getProperty("Libscat")
							});
							return oItemSelectTemplate;
						}
					);

				}.bind(this),
				error: function (oError) {}
			});

			/*Catalogue Validé recupération*/
			var aCustomData = evt.getSource().getSelectedItem().getCustomData();
			var sValcat = aCustomData.find(oCustomData => oCustomData.getKey() === "valCat").getValue();
			this.getView().getModel("CreateModel").setProperty("/ZcatVal", sValcat);

			this.MsgPopOverHdler.removeMsgWithTarget.apply(this, [evt.getSource().getId()]);
			evt.getSource().setValueState("None");
		},

		handlesuggestionItemSelected: function (oEvent) {
			//	debugger;
			var oObject = oEvent.getParameters().selectedItem.getBindingContext().getObject();
			if (oObject) {
				this.MsgPopOverHdler.removeMsgWithTarget.apply(this, [oEvent.getSource().getId()]);
				oEvent.getSource().setValueState("None");
				var sClientName = oObject.ClientName;
				var sContactclient = oObject.Contactclient;
				var sKUNNR = oObject.Kunnr;
				this.getView().byId("Client").setValue(sClientName);
				this.getView().byId("Client").setValue(sKUNNR);
			}

			// this.getView().byId("CC").setValue(sContactclient);
		},

		onSuggest: function (oEvent) {

			// var self = this;
			// var oFilters = [];
			// var oModel = this.getView().getModel("ClientsModel");
			// var oTable = new sap.ui.table.Table();
			// oTable = self.byId("Client");
			// var filters = new Array();
			// var filterByName = new sap.ui.model.Filter("NAME", sap.ui.model.FilterOperator.Contains, "claudio");
			// filters.push(filterByName);
			// var oModelJson = new JSONModel();
			// oModel.read("/Client", null, null, null, function (oData, oResponse) {
			// 	oModelJson.setData(oData);
			// }, null);
			// oModel.read("/persons", {
			// 	filters: filters,
			// 	success: function (oData, oResponse) {
			// 		oModelJson.setData(oData);
			// 	}
			// });
			// oTable.setModel(oModelJson);

			var client = oEvent.getSource();
			var clientValue = client.getValue();
			// var oItemTemplateClient = new sap.ui.core.Item({
			// 	key: "{Expediteur}",
			// 	text: "{Expediteur}"
			// });
			var oItemTemplateClient = client.getBindingInfo("suggestionItems").template;
			var oFiltersClient = [new sap.ui.model.Filter("Expediteur", sap.ui.model.FilterOperator.EQ, clientValue)];
			//		client.bindItems("/ClientSet", oItemTemplateClient, null, oFiltersClient);
			client.bindAggregation("suggestionItems", {
				path: "/ClientSet",
				template: oItemTemplateClient,
				filters: oFiltersClient
			});

			client.setFilterFunction(function (sTerm, oItem) {
				// A case-insensitive "string contains" style filter
				return oItem.getText();
			});
		},

		onSelectionChange: function (oEvent) {

			var selectedKeys = oEvent.getSource().getSelectedKeys();
			var PiloteComponent = oEvent.getSource().getParent().getCells()[0];
			var SelectionComponent = oEvent.getSource().getParent().getCells()[1];
			var serviceComponent = oEvent.getSource().getParent().getCells()[2];

			var selectedlineModel = oEvent.getSource().getBindingContext().getObject();
			var createModel = this.getView().getModel("CreateModel").getData();

			if (PiloteComponent.getSelected()) {
				createModel.Zcservpi = selectedlineModel.Zcserv;
				createModel.Zlibservpi = selectedlineModel.Zlibserv;

			} else if (SelectionComponent.getSelected()) {
				this.MsgPopOverHdler.removeMsgWithTarget.apply(this, ["selection_msg"]);
				createModel.Zcserv = selectedlineModel.Zcserv;
				createModel.Zlibserv = selectedlineModel.Zlibserv;
			}

		},
		onSelectionFinish: function (oEvent) {
			var selectedlineModel = oEvent.getSource().getBindingContext().getObject(),
				aSelectedKeys = oEvent.getSource().getSelectedKeys().filter(e => e),
				oServiceTable = this.getView()
			if (selectedlineModel.Ztypepilote && aSelectedKeys.length > 0) {
				oEvent.getSource().setValueState("None");
				this.MsgPopOverHdler.removeMsgWithTarget.apply(this, [this.getView().byId("idServiceTable").getId()]);
			}
		},

		onPiloteSelected: function (oEvent) {
			var selectedService = oEvent.getSource().getBindingContext().getObject().Zcserv;
			var employeComponent = this.getView().byId("MultiBoxCategorie");
			var oTable = this.getView().byId("idServiceTable");
			if (oEvent.getParameter("selected")) {
				this.MsgPopOverHdler.removeMsgWithTarget.apply(this, [oTable.getId()]);
				for (var i = 0; i < oTable.getItems().length; i++) {
					var oItem = oTable.getItems()[i];
					if (oItem.getBindingContext().getObject().Zcserv === selectedService) {
						oItem.getCells()[1].setEnabled(false);
						oItem.getCells()[1].setSelected(false);
						oItem.getCells()[3].setEnabled(true);
					}
				}
			} else {
				for (var j = 0; j < oTable.getItems().length; j++) {
					var oItem1 = oTable.getItems()[j];
					if (oItem1.getBindingContext().getObject().Zcserv === selectedService) {
						oItem1.getCells()[1].setEnabled(true);
						oItem1.getCells()[3].setEnabled(false);
					}
				}
			}
		},

		onServiceSelectionSelected: function (oEvent) {
			if (oEvent.getParameter("selected")) {
				oEvent.getSource().getParent().getCells()[3].setEnabled(true);

			} else {
				oEvent.getSource().getParent().getCells()[3].setEnabled(false);

			}
		},
		checkInputsErrors: function () {
			var bErrorsExists = false;
			this.checkWizardStepOneErrors();
			this.checkWizardStepTwoErrors();

			var aErrorMsgs = this._MessageManager.getMessageModel().getData().filter(oMsg => oMsg.type === MessageType.Error);

			if (aErrorMsgs.length > 0) {
				bErrorsExists = true;
			}
			return bErrorsExists;
		},
		checkWizardStepOneErrors: function () {
			this.checkMandatoryFieldById("categorieComboBox");
			this.checkMandatoryFieldById("subCategoryId");
			this.checkMandatoryFieldById("natureReceptionCombo");
			var ssCategorie = this.getView().byId("subCategoryId");
			if (ssCategorie.getSelectedItem().getText() !== 'AUTRES') {
				this.checkMandatoryFieldById("typeObjetId");
			}

			this.checkMandatoryFieldById("Ex");
		},
		checkMandatoryFieldById: function (sId) {
			var that = this;
			var oErrorMsg = {};
			var oInput = this.getView().byId(sId);
			if (oInput.getEnabled()) {
				var sInputType = oInput.getMetadata().getName();
				switch (sInputType) {
				case "sap.m.ComboBox":
					var sSelectedValue = oInput.getSelectedKey();
					if (!sSelectedValue) {
						oErrorMsg = {
							sMsgTitle: oInput.getParent().getLabel().getText(),
							sMsgType: MessageType.Error,
							sAddText: "Ce Champs est obligatoire",
							sTarget: oInput.getId(),
							oProcessor: that.getView().getModel(),
							code: "FirstStep"
						};
						that.MsgPopOverHdler.addMessageWithTarget.apply(this, [oErrorMsg])
					}
					// 
					break;
				case "sap.m.Input":
					var sValue = oInput.getValue();
					if (!sValue) {
						oErrorMsg = {
							sMsgTitle: oInput.getParent().getLabel().getText(),
							sMsgType: MessageType.Error,
							sAddText: "Ce Champs est obligatoire",
							sTarget: oInput.getId(),
							oProcessor: that.getView().getModel(),
							code: "FirstStep"
						};
						that.MsgPopOverHdler.addMessageWithTarget.apply(this, [oErrorMsg])
						break;
					}
				default:
					// code block
				}
			}

		},
		onChangeSsCategorie: function (oEvent) {

			var ssCategorie = this.getView().byId("subCategoryId");
			var categoryId = oEvent.getSource().getSelectedKey();
			this.getOwnerComponent().getModel("TypeObjectModel").setData(null);

			var ssTypeObject = this.getView().byId("typeObjetId");
			ssTypeObject.setSelectedKey();
			//	this.getOwnerComponent().getModel().read("/SUB_CATEGORYSet('" + categoryId + "')/Object_TYPESet", {
			this.getOwnerComponent().getModel().read("/SUB_CATEGORYSet('" + categoryId + "')/SubCategory_TO_TYPEOBJECT", {
				success: function (oData, response) {
					this.getOwnerComponent().getModel("TypeObjectModel").setData(oData.results);
					// ssCategorie.setModel(this.getOwnerComponent().getModel("SubcategoryModel"));
					ssTypeObject.setModel(this.getOwnerComponent().getModel("TypeObjectModel"));
					ssTypeObject.bindAggregation("items", "/",
						function (id, context) {
							var oItemSelectTemplate = new sap.ui.core.Item({
								key: context.getProperty("Reftypobj"),
								text: context.getProperty("Libtypobj")
							});
							return oItemSelectTemplate;
						}
					);

				}.bind(this),
				error: function (oError) {}
			});
			this.MsgPopOverHdler.removeMsgWithTarget.apply(this, [oEvent.getSource().getId()]);
			oEvent.getSource().setValueState("None");
		},
		onChangeNatureRecep: function (oEvent) {
			this.MsgPopOverHdler.removeMsgWithTarget.apply(this, [oEvent.getSource().getId()]);
			oEvent.getSource().setValueState("None");
		},
		checkWizardStepTwoErrors: function () {
			this.checkAtLeastOnePiloteIsSelected();
			this.checkAtLeastOneSelectionIsSelected();
		},
		checkAtLeastOnePiloteIsSelected: function () {
			//debugger;
			var that = this,
				oErrorMsg = {},
				bPiloteServiceSelected = false,
				oTable = this.getView().byId("idServiceTable"),
				sPiloteIndex = -1;
			for (var i = 0; i < oTable.getItems().length; i++) {
				var oContext = oTable.getItems()[i].getBindingContext().getObject();
				if (oContext.Ztypepilote) {
					bPiloteServiceSelected = true;
					sPiloteIndex = i;
					break;
				}
			}
			if (!bPiloteServiceSelected) {

				oErrorMsg = {
					sMsgTitle: "Service Pilote",
					sMsgType: MessageType.Error,
					sAddText: "Un Service Pilote doit être selectionnné",
					sTarget: oTable.getId(),
					oProcessor: that.getView().getModel(),
					code: "SecondStep"
				};
				that.MsgPopOverHdler.addMessageWithTarget.apply(this, [oErrorMsg])
			} else {
				var aPiloteEmployees = oTable.getItems()[sPiloteIndex].getBindingContext().getProperty("Zemployee").filter(e => e);
				var bAtleastOneEmployeeIsSelected = aPiloteEmployees.length > 0;
				if (!bAtleastOneEmployeeIsSelected) {
					oErrorMsg = {
						sMsgTitle: "Service Pilote : Employés",
						sMsgType: MessageType.Error,
						sAddText: "Un Service Pilote doit être avoir au moins un employé",
						sTarget: oTable.getId(),
						oProcessor: that.getView().getModel(),
						code: "SecondStep"
					};
					that.MsgPopOverHdler.addMessageWithTarget.apply(this, [oErrorMsg]);
					oTable.getItems()[sPiloteIndex].getCells()[3].setValueState("Error");
				}
			}
		},
		checkAtLeastOneSelectionIsSelected: function () {
		//	debugger;
			var that = this,
				oErrorMsg = {},
				oTable = this.getView().byId("idServiceTable"),
				sPiloteIndex = -1;
			for (var i = 0; i < oTable.getItems().length; i++) {
				var oContext = oTable.getItems()[i].getBindingContext().getObject();
				if (oContext.Ztypeselection) {
					sPiloteIndex = i;
					var aPiloteEmployees = oTable.getItems()[sPiloteIndex].getBindingContext().getProperty("Zemployee").filter(e => e);
					var bAtleastOneEmployeeIsSelected = aPiloteEmployees.length > 0;
					if (!bAtleastOneEmployeeIsSelected) {
						oErrorMsg = {
							sMsgTitle: "Service Seléction : Employés",
							sMsgType: MessageType.Error,
							sAddText: "Un Service Seléction doit être avoir au moins un employé",
							sTarget: "selection_msg",
							oProcessor: that.getView().getModel(),
							code: "SecondStep"
						};
						that.MsgPopOverHdler.addMessageWithTarget.apply(this, [oErrorMsg]);
						oTable.getItems()[sPiloteIndex].getCells()[3].setValueState("Error");
					}
				}
			}
		},
		addCreatedDocSuccesMsg: function (sCreatedId) {
			var aAllMessages = this._MessageManager.getMessageModel().getData();
			var bCreatedDocMsgIndex = aAllMessages.findIndex(oMsg => oMsg.getTarget() === sCreatedId) > -1;

			if (!bCreatedDocMsgIndex) {
				var oProcessor = this.getView().getModel();
				this._MessageManager.addMessages(
					new Message({
						message: "Succès de création",
						type: MessageType.Success,
						additionalText: "le Document " + sCreatedId + " a éte crée avec succès",
						target: sCreatedId,
						processor: oProcessor,
						code: "DocCreated"
					})
				);
				this.reverserMsgsOrder();

				this.getView().byId("messagePopoverBtn").setBusy(true);
				setTimeout(function () {
					this.getView().byId("messagePopoverBtn").firePress();
				}.bind(this), 100);
				this.getView().byId("messagePopoverBtn").setBusy(false);
				this.getView().byId("CreateProductWizard").goToStep(this.getView().byId("FirstStep"));
			}

		},
		reverserMsgsOrder: function () {
			var aInitialData = this._MessageManager.getMessageModel().getData();
			this._MessageManager.removeAllMessages();
			for (var i = aInitialData.length - 1; i > -1; i--) {
				var oInitMsg = aInitialData[i];
				this._MessageManager.addMessages(
					new Message({
						message: oInitMsg.message,
						type: oInitMsg.type,
						additionalText: oInitMsg.additionalText,
						target: oInitMsg.target,
						processor: oInitMsg.processor,
						code: oInitMsg.code
					})
				);
			}

		}

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////		
		/********* Input control's suggest event *********/ //suggest=".onSuggest" 
		// onSuggest: function (oEvent) {
		// 	var sTerm = oEvent.getParameter("suggestValue");
		// 	var oContext = this;
		// 	var aUrlParams = {
		// 		Client: sTerm
		// 	};
		// var oModel =this.getView().getModel();
		// oModel.callFunction("/getAllClient",{
		// 			method: 'GET',
		// 	urlParameters: aUrlParams,
		// 	success:function(oData,oResponse){

		// 	}
		// }

		// );

		// }
		///////////////////////////////////////////////////////////////////////////////////////////
	});
});