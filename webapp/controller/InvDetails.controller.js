sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"com/ifx/approval/Z_MYIBX_INV/util/ConfirmationDialogManager",
	"com/ifx/approval/Z_MYIBX_INV/util/ConfirmationRejectDialog",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/m/Select"
], function (Controller, JSONModel, ConfirmationDialogManager, ConfirmationRejectDialog, MessageToast, MessageBox, Select) {
	"use strict";

	return Controller.extend("com.ifx.approval.Z_MYIBX_INV.controller.InvDetails", {

		oConfirmationDialogManager: ConfirmationDialogManager,
		ConfirmationRejectDialog: ConfirmationRejectDialog,

		// _FORWARD_DIALOG_ID: "DLG_FORWARD",
		// _SEARCH_FIELD_ID: "SFD_FORWARD",
		// _FORWARDER_LIST_ID: "LST_AGENTS",
		// _FORWARDER_ITEM_ID: "ITM_AGENT",

		iMaxAgent: 100,

		// This hook method can be used to change the number of items shown in the forward screen
		// Called before the forward dialog is opened
		extHookChangeListSizeLimit: null,

		onInit: function () {

			var oComponentData = this.getOwnerComponent().getComponentData();
			//	var oAgentList = this.getView().byId(this._FORWARDER_LIST_ID);
			this.oModel = oComponentData.startupParameters.oModel; // set the Model : this model will contain comments data when available
			/*Added by deepti*/
			this.oConfirmationDialogManager.setI18nBundle(this.getOwnerComponent().getModel("i18n").getResourceBundle());
			this.ConfirmationRejectDialog.setI18nBundle(this.getOwnerComponent().getModel("i18n").getResourceBundle());
			this.i18nBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		
			// adding busy indicator sahas
			/*sap.ui.core.BusyIndicator.show();*/
			
		
			var getAcrobatInfo = function () {

				var getBrowserName = function () {

					var userAgent = navigator ? navigator.userAgent.toLowerCase() : "other";

					if (userAgent.indexOf("chrome") > -1) {
						return "chrome";
					} else if (userAgent.indexOf("safari") > -1) {
						return "safari";
					} else if (userAgent.indexOf("msie") > -1 || navigator.appVersion.indexOf('Trident/') > 0) {
						return "ie";
					} else if (userAgent.indexOf("firefox") > -1) {
						return "firefox";
					} else {
						//return "ie";
						return userAgent;
					}

				};

				var getActiveXObject = function (name) {
					try {
						return new ActiveXObject(name);
					} catch (e) {}
				};

				var getNavigatorPlugin = function (name) {
					for (var key = 0; key < navigator.plugins.length; key++) {
						var plugin = navigator.plugins[key];
						if (plugin.name == name) return plugin;
					}
				};

				var getPDFPlugin = function () {

					if (getBrowserName() == 'ie') {
						//
						// load the activeX control
						// AcroPDF.PDF is used by version 7 and later
						// PDF.PdfCtrl is used by version 6 and earlier
						return getActiveXObject('ShockwaveFlash.ShockwaveFlash') || getActiveXObject('AcroPDF.PDF') || getActiveXObject('PDF.PdfCtrl');
					} else {
						return getNavigatorPlugin('Shockwave Flash') || getNavigatorPlugin('Adobe Acrobat') || getNavigatorPlugin('Chrome PDF Viewer') ||
							getNavigatorPlugin('WebKit built-in PDF');
					}

				};

				var isAcrobatInstalled = function () {
					return !!getPDFPlugin();
				};

				var getAcrobatVersion = function () {
					try {
						var plugin = getPDFPlugin();

						if (getBrowserName() == 'ie') {
							var versions = plugin.GetVersions().split(',');
							var latest = versions[0].split('=');
							return parseFloat(latest[1]);
						}

						if (plugin.version) return parseInt(plugin.version);
						return plugin.name
					} catch (e) {
						return null;
					}
				}

				//
				// The returned object
				//
				return {
					browser: getBrowserName(),
					acrobat: isAcrobatInstalled() ? 'installed' : false,
					acrobatVersion: getAcrobatVersion()
				};
			};

			var that = this;
			that.info = getAcrobatInfo();
			if (sap.ui.Device.system.phone) {
				//do not show pop up in mobile devices

			} else {
				if (that.info.acrobat === false) {
					var that = this;
					sap.m.MessageBox.information(that.i18nBundle.getText("IT"));
				}
			}
			//end of plugin check
			if (sap.ui.Device.system.phone) {
				// this.getView().byId("idPDFViewer");
				this.getView().byId("idPDFViewer").setShowDownloadButton(true);

				this.getView().byId("idPDFViewer").setVisible(false);

				this.getView().byId("iFrame").setVisible(false);

				this.getView().byId("idFlexBox").setVisible(false);

				this.getView().byId("idText1").setVisible(true);

				this.getView().byId("idText2").setVisible(true);

				// this.getView().byId("idScrollContainer").setVisible(true);
				this.getView().byId("idScrollContainer").setHeight("100px");

				// this.getView().byId("idPDFViewer").setErrorPlaceholderMessage("Please click on Show Invoice or Download Button to view the PDF");
				// this.getView().byId("idPDFViewer").
			} else {
				// this.getView().byId("idPDFViewer");
				this.getView().byId("idPDFViewer").setShowDownloadButton(false);
				this.getView().byId("idPDFViewer").setVisible(true);

				this.getView().byId("iFrame").setVisible(false);

				this.getView().byId("idFlexBox").setVisible(true);

				this.getView().byId("idText1").setVisible(false);

				this.getView().byId("idText2").setVisible(false);
				// this.getView().byId("idScrollContainer").setVisible(true);
				this.getView().byId("idScrollContainer").setHeight("600px");

			}

			/*Ended by deepti*/
			this.bModelPresent = false;
			var iWorkItemIdInvoice = this.oModel.getData().InstanceID;
			var that = this;

			/*  this.invModel = new sap.ui.model.odata.v2.ODataModel(
			    "/sap/opu/odata/sap/ZINVOICE_VERFICATION_SRV/");
			      
			      if (iWorkItemIdInvoice) {
			        debugger;
			        var ADModel = new sap.ui.model.json.JSONModel();
			      this.invModel
			      .read(
			        "/PoDetailsSet?$filter=WorkItem eq '" + iWorkItemIdInvoice + "'" + "&$expand=NAVASS_PODET",{
			      success:  function (oData, oResponse) {
			          if (oData.results) {
			            var oModel = new JSONModel(oData.results);
			            that.getView().setModel(oModel,"InvModel");
			            
			          } else {
			            // Handle no result
			              }
			        },
			    error : function (oError) {
			          that.showError(oError);
			        }});
			        } else {
			    
			        
			        }*/

			this.invModel = new sap.ui.model.odata.ODataModel(
				"/sap/opu/odata/sap/ZINVOICE_VERFICATION_SRV/", true);
			if (iWorkItemIdInvoice) {
				var ADModel = new sap.ui.model.json.JSONModel();
				this.invModel
					.read(
						"/PoDetailsSet?$filter=WorkItem eq '" + iWorkItemIdInvoice + "'" + "&$expand=NAVASS_PODET",
						null,
						null,
						true,
						function (oData, oResponse) {
							if (oData.results) {

								var oModel = new JSONModel(oData.results[0]);
								that.getView().setModel(oModel, "InvModel");

								var temp = that.getView().getModel("InvModel").oData.Bukrs;
								var len = that.getView().getModel("InvModel").oData.NAVASS_PODET.results.length;
								for (var i = 0; i < len; i++) {
									that.getView().getModel("InvModel").oData.NAVASS_PODET.results[i].Comp = temp;

								}
								that.getView().getModel("InvModel").refresh();
								that.getView().getModel("InvModel").updateBindings(true);

								//	var URL = that.getView().getModel("InvModel").oData.InvImageUrl;
								// that.getView().getModel("InvModel").oData.InvImageUrl
								/*	var onerr = function (){
										
										alert("onerror");
									};*/
								//onerror=" + onerr + "
								/*		that.oHtml = that.getView().byId("iFrame");
										that.oHtml.setContent("<iframe id ='iFrame' embed src=" + URL +
											" height='600px' width='100%' type='application/pdf'></iframe>");*/
								/*var temp1 = that.getView().getModel("InvModel").oData.NAVASS_PODET.results;*/
								/* var temp1 = that.getView().getModel("InvModel");
								 var oModel2 = new sap.ui.model.json.JSONModel();
								 oModel2.setData(temp1);
								 that.getView().setModel(oModel2,"oModel3");*/
								/*that.getView().byId("ccode").setText(temp);*/
							} else {
								// Handle no result

							}
							jQuery.sap.delayedCall(2000, this, function() {
									sap.ui.core.BusyIndicator.hide();
					
				});
						},

						function (oError) {
							
								jQuery.sap.delayedCall(2000, this, function() { //by sahas
									sap.ui.core.BusyIndicator.hide();
								});
					
							that.showError(oError);
						});

			}

			var oActionSave = {
					action: "Save",
					label: "Clarification"
				},
				oActionAccept = {
					type: "Accept",
					action: "Accept",
					label: "Approve"
				},
				oActionReject = {
					type: "Reject",
					action: "Reject",
					label: "Reject"
				},
				oActionShowInvoice = {
					action: "ShowInvoice",
					label: "Show Invoice"

				},
				oActionForward = {
					id: "Footerforwardid",
					action: "Forward",
					label: "Forward"

				};

			var fnHandleSave = function (oEvent) {
				var oDecision = {
					/*DecisionText: "Clarification",*/
					DecisionText: "Clarification",
					CommentMandatory: true
				};
				that.oConfirmationDialogManager.showDecisionDialog({
					question: that.i18nBundle.getText("XMSG_DECISION_QUESTION_clarif", oDecision.DecisionText),
					showNote: true,
					title: that.i18nBundle.getText("XTIT_SUBMIT_DECISION"),
					confirmButtonLabel: that.i18nBundle.getText("XBUT_SUBMIT"),
					noteMandatory: oDecision.CommentMandatory,
					confirmActionHandler: jQuery.proxy(function (oDecision, sNote) {
							that.sendAction(oDecision, sNote);
						},
						this, oDecision)
				});
			};
			var fnHandleAccept = function (oEvent) {
				var oDecision = {
					/*DecisionText: "Approve",*/
					DecisionText: "Approve",
					CommentMandatory: false
				};
				that.oConfirmationDialogManager.showDecisionDialog({
					question: that.i18nBundle.getText("XMSG_DECISION_QUESTION_Approve", oDecision.DecisionText),
					showNote: true,
					title: that.i18nBundle.getText("XTIT_SUBMIT_DECISION"),
					confirmButtonLabel: that.i18nBundle.getText("XBUT_SUBMIT"),
					noteMandatory: oDecision.CommentMandatory,
					confirmActionHandler: jQuery.proxy(function (oDecision, sNote) {
							that.sendAction(oDecision, sNote);
						},
						this, oDecision)
				});
			};
			var fnHandleReject = function (oEvent) {

				var data = {
					"mRoot": [{
						"dkey": "INVVER_INCORR_GR",
						"dtext": "Invoice incorrect - Goods received"
					}, {
						"dkey": "INVVER_INCORR_NO_GR",
						"dtext": "Invoice incorrect - Goods not received"
					}, {
						"dkey": "INVVER_CORR_NO_GR",
						"dtext": "Invoice correct - Goods not received"
					}, {
						"dkey": "NOT_RESP",
						"dtext": "Not Responsible or Clarification"
					}]
				};

				var oRReasonModel = new JSONModel(data);

				//call dailog and get user decision
				/*var InvObject = that.getView().getModel("InvModel").getData();*/

				var oDecision = {
					DecisionText: "Reject",

					CommentMandatory: true,
					userResponse: "" //assign user decision value 
				};
				var oControl = new Select({
					change: function (oEvent) {
						debugger;
					}
				});
				var oItemSelectTemplate = new sap.ui.core.Item({
					key: "{dkey}",
					text: "{dtext}"
				});
				oControl.setModel(oRReasonModel);
				oControl.bindAggregation("items", "/mRoot", oItemSelectTemplate);
				oControl.addStyleClass("sapUiTinyMargin");

				that.ConfirmationRejectDialog.showDecisionDialog({
					/*question: that.I18nBundle.getText("XMSG_DECISION_QUESTION", oDecision.DecisionText),*/

					question: that.i18nBundle.getText("XMSG_DECISION_QUESTION_Reject"),
					showNote: true,
					control: oControl,
					title: that.i18nBundle.getText("XTIT_SUBMIT_DECISION"),
					confirmButtonLabel: that.i18nBundle.getText("XBUT_SUBMIT"),
					noteMandatory: oDecision.CommentMandatory,
					confirmActionHandler: jQuery.proxy(function (oDecision, sNote, sUserResponse) {
							if (sUserResponse) {
								oDecision.userResponse = sUserResponse;
							}
							that.sendAction(oDecision, sNote);
						},
						this, oDecision)
				});
			};
			// ADDED BY DEEPTI
			var fnHandleShowInvoice = function (oEvent) {
				debugger;
				// alert("CLICKED SHOW INVOICE Button");

				/*var oItem, oCtx;*/
				that.openPdf();

			};
			var fnHandleForward = function (oEvent) {
				debugger;

				if (oActionForward.id == "Footerforwardid") {
					that.handleForward();
				}

			};
			this.bOutbox = oComponentData.inboxHandle.inboxDetailView.oDataManager.bOutbox;
			// this will return a Boolean value with this flag the you can control the adding of the action button to the my inbox footer

			// Action buttons are added only if “this.bOutbox” is false. 
			if (!this.bOutbox) {
				// ADDED by Deepti

				this.getOwnerComponent().getComponentData().startupParameters.inboxAPI.removeAction(oActionSave.action); //clarification
				this.getOwnerComponent().getComponentData().startupParameters.inboxAPI.removeAction(oActionAccept.action);
				this.getOwnerComponent().getComponentData().startupParameters.inboxAPI.removeAction(oActionReject.action);
				this.getOwnerComponent().getComponentData().startupParameters.inboxAPI.removeAction(oActionForward.action);
				// end
				
				this.getOwnerComponent().getComponentData().startupParameters.inboxAPI.addAction(oActionSave, fnHandleSave);       //clarification
				this.getOwnerComponent().getComponentData().startupParameters.inboxAPI.addAction(oActionAccept, fnHandleAccept);
				this.getOwnerComponent().getComponentData().startupParameters.inboxAPI.addAction(oActionReject, fnHandleReject);
				this.getOwnerComponent().getComponentData().startupParameters.inboxAPI.addAction(oActionForward, fnHandleForward);
			}
			//for Show Invoice Button

			this.getOwnerComponent().getComponentData().startupParameters.inboxAPI.addAction(oActionShowInvoice, fnHandleShowInvoice);
			this.getOwnerComponent().getComponentData().startupParameters.inboxAPI.reverseActionOrder(); //To show "Show Invoice" button next to Approve reject.

			// ENDED BY DEEPTI
			/*var sServiceUrl = "https://sapqpsa2.sap.infineon.com:8459/sap/opu/odata/sap/ZINVOICE_VERFICATION_SRV";
			var oModel = new sap.ui.model.odata.oDataModel(sServiceUrl,true);
			var oJsonModel = new sap.ui.model.json.JSONModel();
			oModel.read = ("/PoDetailsSet",null,null,true,function(odata,response){  
			  oJsonModel.setdata(odata);
			    });
			    sap.ui.getcore().setModel(oJsonModel);*/

			/*var oData = {
        "Details": [{
        "Name" : "20107951",
        "Qty" : "1",
        "Value" : "Umbau Kabelkanal",
        "Price" : "100",
        "PoDetQty" : "20",
        "Price2" : "123"
      
        },{
          
        "Name" : "20107456",
        "Qty" : "2",
        "Value" : "3006182613",
        "Price" : "200",
        "PoDetQty" : "10",
        "Price2" : "568"
        },{
          
        "Name" : "20107415",
        "Qty" : "3",
        "Value" : "352587416",
        "Price" : "300",
        "PoDetQty" : "30",
        "Price2" : "845"
        }]
        
        };
      
  
      // var oModel = new sap.ui.model.json.JSONModel();
      // oModel.setData(oData);
      // sap.ui.getCore().setModel(oModel);

    var oModel = new JSONModel(oData);
    this.getView().setModel(oModel);*/

			/*var mData = {
			      "Info": [{
			      "invoic" : "20170484",
			      "Pay" : "060-within 60 days Due net",
			      "ven" : "Industrie-Service Müller GmbH",
			      "date" : "26.11.2018",
			      "sap" : "050029654",
			      "Currency" : "540",
			      "CurrencyCode" : "INR"
			      }]
			  };
			  var mModel = new JSONModel(mData);
			  this.getView().setModel(mModel, "mModel");*/

			var ADScreen = new sap.ui.model.json.JSONModel({
				isADList: true
			});
			this.getView().setModel(ADScreen, "ADScreen");
			this.ADScreenModel = this.getView().getModel("ADScreen");

			/*var cData = {
			    "Structure": [{
			    "Item" : "00010",
			    "Qty" : "6353.000ST",
			    "Amount" : "759.69EUR"
			  
			    },{
			      
			    "Item" : "Open Quantity",
			    "Qty" : "0.000ST",
			    "Amount" : "0.00EUR"
			    },{
			      
			    "Item" : "Invoiced Quantity",
			    "Qty" : "6353.000ST",
			    "Amount" : "759.69EUR"
			    },{
			      
			    "Item" : "Parked Quantity",
			    "Qty" : "0.000",
			    "Amount" : "0.00"
			    }]
			    
			    };*/

			/* var fModel = new JSONModel(cData);
    this.getView().setModel(fModel, "fModel");*/

		},

		/**&nbsp;
		 * to parse the oData Error Reposnse and show as mssage.
		 * @param oError
		 */
		showError: function (oError) {

			var messages = new Array();

			if (oError.response) {
				if (oError.response.body) {
					if (jQuery.parseJSON(oError.response.body).error.innererror.errordetails) {

						for (var i = 0; i < jQuery.parseJSON(oError.response.body).error.innererror.errordetails.length; i++) {
							messages
								.push(jQuery
									.parseJSON(oError.response.body).error.innererror.errordetails[i].message);
						}
					}
					if (jQuery.parseJSON(oError.response.body).error.message) {

						messages
							.push(jQuery
								.parseJSON(oError.response.body).error.message.value);

					}
				}
			}
			var messageTxt = '';
			if (messages.length > 0) {
				for (var i = 0; i < messages.length; i++) {
					messageTxt = messages[i] + '\n' + '\n' + messageTxt;
				}
			}
			if (messages.length == 0) {

				messageTxt = oError.response.body + '\n';

			}
			sap.m.MessageBox.show(messageTxt, {
				icon: sap.m.MessageBox.Icon.ERROR,
				title: "Error"
			});
		},

		onADDetailsPress: function (oEvent) {

			this.ADScreenModel.getData().isADList = false;
			this.ADScreenModel.updateBindings();
			debugger;
			var oItem, oCtx;
			var that = this;
			oItem = oEvent.getParameter("listItem");
			oCtx = oItem.getBindingContextPath();
			var headerObject = this.getView().getModel("InvModel").getData();
			var itemObject = this.getView().getModel("InvModel").getProperty(oCtx);

			//var item = this.getView().getModel("InvModel").getData();
			//"/NAVASS_PODET/results"+oCtx);// "/0/"
			//Event.mParameters.listItem.getBindingContext("undefined").getObject();
			//  headerObject.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

			// read call for 2nd URL  oData
			//  ?$filter=Belnr eq '0081101016' and Gjahr eq '2017' and Ebelp eq '10' and Ebeln eq '4501427445' and Bukrs eq '7111'&$expand=NAVASS_INVPODET
			//  "/PoDetailsSet?$filter=WorkItem eq '" + iWorkItemIdInvoice + "'" + "&$expand=NAVASS_PODET",

			//var qModel = new sap.ui.model.json.JSONModel();
			//this.getView().setModel(this.getView().getModel("InvModel").getProperty(oCtx),qModel);

			var oBukrs = headerObject.Bukrs;
			var oBelnr = headerObject.Belnr;
			var oGjahr = headerObject.Gjahr;
			var oEbelp = itemObject.Ebelp;
			var oEbeln = itemObject.Ebeln;
			var oSgtxt = itemObject.Sgtxt;

			this.getView().byId("Desc").setText(oSgtxt);
			//this.getView().getModel(qModel).Ebeln;

			this.invModelObject = new sap.ui.model.odata.ODataModel(
				"/sap/opu/odata/sap/ZINVOICE_VERFICATION_SRV/", true);
			if (itemObject && headerObject) {
				var ADModel = new sap.ui.model.json.JSONModel();

				//"/PoDetailsSet?$filter=Belnr eq '" + SAPno + "' Gjahr eq '" + SAPno + "' Ebelp eq '" + SAPno + "'Bukrs eq '" + SAPno + "'" + "&$expand=NAVASS_INVPODET ",
				//  "/PoDetailsSet?$filter=WorkItem eq '" + iWorkItemIdInvoice + "'" + "&$expand=NAVASS_PODET",
				// $filter=Belnr eq '0081101016' and Gjahr eq '2017' and Ebelp eq '10' and Ebeln eq '4501427445' and Bukrs eq '7111'&$expand=NAVASS_INVPODET

				this.invModelObject
					.read(
						"/PoDetailsSet?$filter=Belnr eq '" + oBelnr + "' and Gjahr eq '" + oGjahr + "' and Ebeln eq '" + oEbeln + "' and Ebelp eq '" +
						oEbelp + "' and Bukrs eq '" + oBukrs + "'&$expand=NAVASS_INVPODET,InvoiceLineSet ",
						null,
						null,
						true,
						function (oData, oResponse) {
							if (oData.results) {
								var qModel = new JSONModel(oData.results[0]);
								that.getView().setModel(qModel, "InvPoModel");

								var oFilter = new sap.ui.model.Filter("Vgabe", sap.ui.model.FilterOperator.Contains, "P");
								that.getView().byId("ParList").getBinding("items").filter([oFilter]);
								var oFilter2 = new sap.ui.model.Filter("Vgabe", sap.ui.model.FilterOperator.Contains, "2");
								that.getView().byId("InvList").getBinding("items").filter([oFilter2]);
								/*       var mainModel = that.getView().getModel("InvPoModel").oData;
	             
	               var results1 = {
					data1  : []
				};
				var oTableModel1 = new sap.ui.model.json.JSONModel();
				oTableModel1.setData(results1);
				that.getView().setModel(oTableModel1,"oTableModel1");
				
				var results2 = {
					data2  :[]
				};
				var oTableModel2 = new sap.ui.model.json.JSONModel();
				oTableModel2.setData(results2);
				that.getView().setModel(oTableModel2,"oTableModel2");
	
	
			/*for(var i=0;i<oData.results[0].InvoiceLineSet.results.length;i++)*/
								/*	for(var i=0;i<mainModel.InvoiceLineSet.results.length;i++)
									{
										
										/*if(oData.results[0].InvoiceLineSet.results[i].Vgabe === "2")*/
								/*		if(mainModel.InvoiceLineSet.results[i].Vgabe == "2")
				{
					that.getView().getModel("oTableModel1").getData().data1.push(oData.results[i]);
				} else if(mainModel.InvoiceLineSet.results[i].Vgabe == "P")
				{
					that.getView().getModel("oTableModel2").getData().data2.push(oData.results[i]);
				}
	} 
				that.getView().getModel("oTableModel1").refresh();
              that.getView().getModel("oTableModel1").updateBindings(true);
              that.getView().getModel("oTableModel2").refresh();
              that.getView().getModel("oTableModel2").updateBindings(true);*/
							} else {
								// Handle no result

							}

							/* var tableId1 = this.getView().byId("__xmlview7--InvList");*/
							/*var tableId1 = sap.ui.getCore().byId("InvList");
							tableId1.setModel("oTableModel1");*/
							/*var tableId2 = this.getView().byId("__xmlview7--ParList");*/
							/*var tableId2 = sap.ui.getCore().byId("ParList");
							tableId2.setModel("oTableModel2");*/
						},

						function (oError) {
							that.showError(oError);
						});

			}

		},

		onPdfClick: function (oEvent) {

			/*var oItem, oCtx;*/
			var that = this;

			/*		var lineItem = oEvent.getSource().getBindingContext("InvPoModel").getPath().split("/")[3];
					var url = that.getView().getModel("InvPoModel").oData.InvoiceLineSet.results[lineItem].InvImageUrl;*/
			//commented by deepti

			var url = oEvent.getSource().getBindingContext("InvPoModel").getProperty(oEvent.getSource().getBindingContext(
				"InvPoModel").getPath()).InvImageUrl;

			if (url == "") {
				sap.m.MessageToast.show(that.i18nBundle.getText("NotAvailable"));
			} else {

				//sap.m.URLHelper.redirect(url, true);
				parent.window.open(url, 'blank');
			}

		},
		onPdfError: function () {
			var that = this;
			sap.m.MessageToast.show(that.i18nBundle.getText("Error"));

		},
		// onPdfLoaded: function(){
		// 	sap.m.MessageBox.information("onPdfLoaded");

		// },
		// onsourceValidationFailed: function()
		// {
		// 		sap.m.MessageBox.information("onsourceValidationFailed");
		// },
		//success
		//create JSONModel
		//change the bingings if required in View

		/*  var cModel = new JSONModel(cdata);
    this.getView().setModel(cModel, "cModel");
    
    this.ADScreenModel.getData().isADList = false;
    this.ADScreenModel.updateBindings();*/

		onPress: function (oEvent) {

			this.ADScreenModel.getData().isADList = true;
			this.ADScreenModel.updateBindings();
		},

		sendAction: function (oDecision, sNote) {
			var sSuccessMessage;

			var InvDetailObject = this.getView().getModel("detail").getData();
			var InvObject = this.getView().getModel("InvModel").getData();
			var that = this;
			var sSAPOrigin = this.oModel.getData().SAP__Origin;
			var sInstNo = InvDetailObject.InstanceID;

			var ActionObject = {};
			ActionObject.COMMENTS = sNote;
			ActionObject.WORKITEMID = sInstNo;

			ActionObject.BELNR = InvObject.Belnr;
			ActionObject.GJAHR = InvObject.Gjahr;
			ActionObject.BUKRS = InvObject.Bukrs;

			switch (oDecision.DecisionText) {
			case "Clarification":
				if (InvObject.Process == "A") {
					ActionObject.USER_RESPONSE = "NOT_RESP";
				} else {
					ActionObject.USER_RESPONSE = "NOT_RESP";
				}
				break;
			case "Approve":
				if (InvObject.Process == "A") {
					ActionObject.USER_RESPONSE = "INVVER_CORR_GR";
				} else if (InvObject.Process == "B") {
					ActionObject.USER_RESPONSE = "PO_EXISTS";
				} else {
					ActionObject.USER_RESPONSE = "POSTED";
				}
				break;
			case "Reject":
				if (InvObject.Process == "A") {
					ActionObject.USER_RESPONSE = oDecision.userResponse;
				} else if (InvObject.Process == "B") {
					ActionObject.USER_RESPONSE = "NOT_RESP";
				} else {
					ActionObject.USER_RESPONSE = "NOT_POSTED";

				}

			}

			this.fnShowReleaseLoader(true);
			//if else added on 22.08.19 by rutuja
			if (sNote.length > 0) {

				this.getOwnerComponent().getComponentData().inboxHandle.inboxDetailView.oDataManager.addComment(sSAPOrigin, sInstNo, sNote, jQuery
					.proxy(
						function (data, response) {
							that.updateAction(ActionObject, sSAPOrigin, sInstNo);
						}, this), jQuery.proxy(function (oError) {
						that.showError(oError);
					}, this));

			} else {
				that.updateAction(ActionObject, sSAPOrigin, sInstNo);
			}

		},

		postComment: function (sSAPOrigin, sInstNo, sNote) {
			var that = this;
			this.getOwnerComponent().getComponentData().inboxHandle.inboxDetailView.oDataManager.addComment(sSAPOrigin, sInstNo, sNote, jQuery.proxy(
				function (data, response) {

				}, this), jQuery.proxy(function (oError) {
				that.showError(oError);
			}, this));
		},

		fnShowReleaseLoader: function (bValue) {
			var oValue = {};
			oValue["bValue"] = bValue;
			if (this.bModelPresent) { // only if the model is set, add comment
				//	this.getOwnerComponent().getEventBus().publish("cross.fnd.fiori.inbox.dataManager", "showReleaseLoader", oValue);
				var oComments = this.getOwnerComponent().oComponentData.inboxHandle.inboxDetailView._getIconTabControl("Comments");
				this.getView().setBusy(bValue);
				this.getOwnerComponent().oComponentData.inboxHandle.inboxDetailView._setBusyIncdicatorOnDetailControls(oComments, bValue);
			}
		},

		refreshTask: function (sSAP__Origin, sInsNo) {
			this.fnShowReleaseLoader(false);
			this.getOwnerComponent().getComponentData().inboxHandle.inboxDetailView.oDataManager.fireItemRemoved();
			this.getOwnerComponent().getComponentData().inboxHandle.inboxDetailView.oDataManager.oModel.refresh();
			this.getOwnerComponent().getComponentData().inboxHandle.inboxDetailView.oDataManager.processListAfterAction(sSAP__Origin, sInsNo);
			this.getOwnerComponent().getComponentData().inboxHandle.inboxDetailView.oDataManager.triggerRefresh("SENDACTION", this.getOwnerComponent()
				.getComponentData().inboxHandle.inboxDetailView.oDataManager.ACTION_SUCCESS);
			// this.getOwnerComponent().getComponentData().inboxHandle.inboxDetailView.oDataManager.triggerRefresh("FORWARD", this.getOwnerComponent()
			// .getComponentData().inboxHandle.inboxDetailView.oDataManager.ACTION_SUCCESS);
			//this.triggerRefresh("FORWARD", this.ACTION_SUCCESS);
			this.getOwnerComponent().getComponentData().inboxHandle.inboxDetailView.oDataManager.fireActionPerformed();

		},

		updateAction: function (ActionObject, sSAPOrigin, sInstNo) {
			var that = this;

			this.invModel.create(
				'/ActionSet',
				ActionObject,
				null,
				function (oData, oResponse) {

					if (oData.MSGTYPE == "E") {
						sap.m.MessageBox.error(oData.MSG, {
							onClose: function (oEvent) {
								that.refreshTask(sSAPOrigin, sInstNo);
							}
						});
					} else {
						sap.m.MessageToast.show("Successfully Done");
						that.refreshTask(sSAPOrigin, sInstNo);
						//	window.scroll(0, 0);
					}

				},
				function (oError) {
					that.showError(oError);
				});
		},
		openPdf: function () {

			debugger;
			var pdfUrl = this.getView().getModel("InvModel").oData.InvImageUrl;
			sap.m.URLHelper.redirect(pdfUrl, true);
			//parent.window.open(urlProvidingFile, 'blank'); 
		},
		handleForward: function (oEvent) {
			debugger;
			var that = this;
			var oView = this.getView();
			if (!this.dialog) {
				// This fragment opens the forward dialog after the click on Fotter forward button.
				this.dialog = sap.ui.xmlfragment("com.ifx.approval.Z_MYIBX_INV.util.dialog", this);
				oView.addDependent(this.dialog);
			}

			this.invModelObject = new sap.ui.model.odata.ODataModel(
				"/sap/opu/odata/sap/ZINVOICE_VERFICATION_SRV/", true); //Service for the users in the forward dialog

			this.invModelObject
				.read(
					"/ET_USER_DETAILSSet",
					null,
					null,
					true,
					function (oData, oResponse) {
						if (oData.results) {
							debugger;
							var oModel = new JSONModel(oData.results);
							that.getView().setModel(oModel, "UserModel");
							that.dialog.open();

						} else {
							// Handle no result

						}

					},

					function (oError) {
						that.showError(oError);
					});

		},
		onCancelDialog: function (oEvent) {

			oEvent.getSource().getParent().close();
		},

		//not in approval dashboard
		// onLiveChange: function (oEvent) {
		// 	if (this.getView().byId(this._FORWARD_DIALOG_ID).getModel().getProperty('/isPreloadedAgents')) {
		// 		var sSearchTerm = oEvent.getParameters().newValue;

		// 		var aListItems = this.getView().byId("LST_AGENTS").getItems();
		// 		for (var i = 0; i < aListItems.length; i++) {
		// 			var bVisibility = this.fnStartSearch(aListItems[i], sSearchTerm);
		// 			aListItems[i].setVisible(bVisibility);
		// 		}
		// 		this.getView().byId("LST_AGENTS").rerender();
		// 	}
		// },

		onAgentSearch: function (oEvent) {
			var searchValue = oEvent.getParameter('query');
			var filterName = new sap.ui.model.Filter("NAME", sap.ui.model.FilterOperator.Contains, searchValue);
			//	var filterPCNDesc = new sap.ui.model.Filter("description", sap.ui.model.FilterOperator.Contains, searchValue);
			var oBinding = this.dialog.getContent()[0].getBinding("items");
			var filters = new Array();
			filters.push(filterName);
			//	filters.push(filterPCNDesc);
			oBinding.filter(new sap.ui.model.Filter(filters, false));

		},
		// _findListItemById: function (sId) {
		// 	var aListItems = this.dialog.mAggregations.content[0].getItems();

		// 	//var aListItems = this.getView().byId("LST_AGENTS").getItems();
		// 	// for (var i = 0; i < aListItems.length; i++) {
		// 	// 	if (aListItems[i].getId() === sId) {
		// 	// 		return aListItems[i];
		// 	// 	}
		// 	// }
		// },
		onSelectAgent: function (oEvent) {
			//	var oSelectedItem = this._findListItemById(oEvent.getParameters().id);
			//	if (oSelectedItem && oSelectedItem.getBindingContext()) {

			//1. close the current dialog at first
			oEvent.getSource().getParent().close();
			//old	this.getView().byId(this._FORWARD_DIALOG_ID).close();

			var oSelectedItem = this.dialog.mAggregations.content[0].getSelectedItem();
			this.oSelectedAgent = oSelectedItem.mProperties.info;

			//now this.oSelectedAgent = oSelectedItem.getBindingContext().getObject();
			//old code
			// var oSelectedAgent = oSelectedItem.getBindingContext().getObject();
			//var oDlgModel = this.getView().byId(this._FORWARD_DIALOG_ID).getModel();

			var sQuestion = "Please Enter Comments for Forwarding";

			//2. open the confirmation dialog
			this.oConfirmationDialogManager.showDecisionDialog({
				question: sQuestion,
				textAreaLabel: sap.ca.scfld.md.app.Application.getImpl().getComponent().oDataManager.oi18nResourceBundle.getText(
					"XFLD_TextArea_Forward"),
				showNote: true,
				noteMandatory: true,
				title: sap.ca.ui.utils.resourcebundle.getText("forward.title"),
				confirmButtonLabel: sap.ca.ui.utils.resourcebundle.getText("forward.button"),
				confirmActionHandler: $.proxy(function (sNote) {
					this.forwardConfirmClose(sNote);
				}, this)
			});
		},

		forwardConfirmClose: function (sNote) {
			//on press of OK after comments
			var that = this;
			var oNewResult = {};
			oNewResult = {
				bConfirmed: true,
				sNote: sNote,
				oAgentToBeForwarded: that.oSelectedAgent //this is the confirmation dialog object
			};

			this.dialogClose(this, oNewResult);
		},
		dialogClose: function (oEvent, oNewResult) {
			var that = this;
			oEvent.dialog.close(oNewResult);
			//	var that = this;
			//that.fnShowReleaseLoader(true);
			var sSAPOrigin = this.oModel.getData().SAP__Origin;
			var sInstNo = this.oModel.getData().InstanceID;
		//	sap.m.MessageToast.show("Successfully Done");
			
		
			
		/*	this.getOwnerComponent().getComponentData().inboxHandle.inboxDetailView.oDataManager.doForward(sSAPOrigin, sInstNo, oNewResult.oAgentToBeForwarded,
				oNewResult.sNote, jQuery.proxy(function () {
					sap.ca.ui.message.showMessageToast(this.i18nBundle.getText("dialog.success.forward", oNewResult.oAgentToBeForwarded));

				}, this));
				*/
					
			var oSelectedItem = this.dialog.mAggregations.content[0].getSelectedItem();
			this.oSelectedAgent = oSelectedItem.mProperties.info;
			var InvObject = this.getView().getModel("InvModel").getData();
			var ActionObject = {};

			ActionObject.SWW_WIID = sInstNo;
			ActionObject.EMAIL = "";
			ActionObject.BNAME = "";
			ActionObject.NAME = "";
			ActionObject.USER = "";
			ActionObject.BUKRS = InvObject.Bukrs;
			ActionObject.USER_ID = this.oSelectedAgent;
			ActionObject.COMMENTS = oNewResult.sNote;
			ActionObject.USER_RESPONSE = "FORWARD" ;
			ActionObject.BELNR = InvObject.Belnr;
			ActionObject.GJAHR = InvObject.Gjahr;
			ActionObject.MESSAGE_TYPE = "";
			ActionObject.MESAGE = "";

		
			this.postMethod(ActionObject, sSAPOrigin, sInstNo);

			


/*
					"SWW_WIID" 
					"BUKRS",
					"USER_ID",
					"COMMENTS",
					"USER_RESPONSE"",
					"BELNR",
					"GJAHR", 
					
					
					{
  "d" : {

        "SWW_WIID" : "123555",
        "EMAIL" : "",
        "BNAME" : "CAOF_MRP_1",
        "NAME" : "",
        "USER" : "",
        "BUKRS" : "",
        "USER_ID" : "",
        "COMMENTS" : "",
        "USER_RESPONSE" : "",
        "BELNR" : "",
        "GJAHR" : "",
        "MESSAGE_TYPE" : "",
        "MESAGE" : ""

       }
}


					
					
				*/
			
		
		
		},

		postMethod: function (ActionObject, sSAPOrigin, sInstNo) {
			var that = this;

			this.invModel.create(
				'/ET_USER_DETAILSSet', //service
				ActionObject,
				null,
				function (oData, oResponse) {

				/*	if (oData.MSGTYPE == "E") {
						sap.m.MessageBox.error(oData.MSG, {
							onClose: function (oEvent) {
								that.refreshTask(sSAPOrigin, sInstNo);
							}
						});
					} else {*/
						sap.m.MessageToast.show("Successfully Done");
						that.refreshTask(sSAPOrigin, sInstNo);
						//	window.scroll(0, 0);
				/*	}*/

					
				},

				function (oError) {
					that.showError(oError);
				});

		},

		onSourceValidation: function (oEvent) {

			oEvent.preventDefault();
			//	oEvent.getSource().stopPropagation();
		}

		/*	onError : function(oEvent){
			alert("in onError");
			oEvent.getSource().preventDefault();
		},
		onLoaded : function(oEvent){
			
				alert("in onLoaded");
			oEvent.getSource().preventDefault();
		}
*/

	});
});