/*
* Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
*/
sap.ui.define([
                "sap/ui/base/Object",
                "sap/m/Button",
                "sap/m/Dialog",
                "sap/m/Text",
                "sap/m/TextArea",
                "sap/m/Label",
                'sap/ui/layout/VerticalLayout'
], function(Object, Button, Dialog, Text, TextArea,Label,VerticalLayout) {
                "use strict";
                return {
                                getI18nBundle: function() {
                                                return this.oResourceBundle;
                                },
                                setI18nBundle: function(resourceBundel) {
                                                this.oResourceBundle= resourceBundel;
                                },
                               /* showRadioDialog: function(){
                                	
                                },*/
                                
                                showDecisionDialog: function(oDialogSettings) {
                                                oDialogSettings = this._initializeDialogSettings(oDialogSettings);
                                                var oDialog = this._createConfirmationDialog(oDialogSettings.noteMandatory, oDialogSettings.question, oDialogSettings.control,oDialogSettings.title, oDialogSettings.confirmButtonLabel, oDialogSettings.showNote);
                                                oDialog.getBeginButton().attachPress(jQuery.proxy(function(oEvent) {
                                                                                                var sNote;
                                                                                                if(oDialogSettings.showNote){
                                                                                                                sNote = sap.ui.getCore().byId('confirmDialogTextarea').getValue();
                                                                                                }
                                                                                                if(!sNote){
                                                                                                                sNote = "";
                                                                                                }
                                                                                                oDialogSettings.confirmActionHandler(sNote,oDialogSettings.control.getSelectedKey());
                                                                                                oEvent.getSource().getParent().close();
                                                                                }, this));
                                                oDialog.open();
                                },
                                
                                _initializeDialogSettings: function(oDialogSettings){
                                                return jQuery.extend({
                                                                noteMandatory: false,
                                                                question: "",
                                                                title: "",
                                                                control:null,
                                                                confirmButtonLabel: "",
                                                                showNote: false,
                                                                confirmActionHandler : function(){ 
                                                                                return;
                                                                }
                                                },oDialogSettings);
                                },
                                
                                _createConfirmationDialog: function(bNoteMandatory, sQuestion, oControl, sTitle, sButtonLabel, bShowNote){
                                                var aContent;
                                                if(bShowNote){
                                                                aContent = [
                                                                					new VerticalLayout({
                                                                					 content : [	
                                                                                new Text("confirmDialogText1", {
                                                                                                text: sQuestion
                                                                                }),
                                                                                new Label({
                                                                                	text: this.getI18nBundle().getText("XLBL_REJECT_REASON")
                                                                                	
                                                                                }),
                                                                                oControl
                                                                                	]
                                                                					}),
                                                                                new TextArea("confirmDialogTextarea", {
                                                                                                liveChange: function(oEvent) {
                                                                                                                var sText = oEvent.getParameter('value');
                                                                                                                var oDialogControl = oEvent.getSource().getParent();
                                                                                                                oDialogControl.data("note", sText);
                                                                                                                if (bNoteMandatory) {
                                                                                                                                oDialogControl.getBeginButton().setEnabled(sText.trim().length > 0);
                                                                                                                }
                                                                                                },
                                                                                                maxLength: 10000,
                                                                                                width: '100%',
                                                                                                placeholder: this.getI18nBundle().getText(bNoteMandatory ? "XMSG_COMMENT_MANDATORY" : "XMSG_COMMENT_OPTIONAL")
                                                                                })
                                                                				
                                                                ];
                                                }else{
                                                                aContent = [
                                                                                new Text("confirmDialogText1", {
                                                                                                text: sQuestion
                                                                                })
                                                                ];
                                                }
                                                
                                                var oDialog = new Dialog({
                                                                title: sTitle,
                                                                type: 'Message',
                                                                content: aContent,             
                                                                beginButton: new Button({
                                                                                text: sButtonLabel,
                                                                                tooltip:this.getI18nBundle().getText("submit.request"),
                                                                                enabled: !bNoteMandatory
                                                                }),
                                                                endButton: new Button({
                                                                                text: this.getI18nBundle().getText("XBUT_CANCEL"),
                                                                                tooltip:this.getI18nBundle().getText("cancel.request"),
                                                                                press: function(oEvent) {
                                                                                                oDialog.close();
                                                                                }
                                                                }),
                                                                afterClose: function(oEvent) {
                                                                                oEvent.getSource().destroyContent();
                                                                }
                                                });
                                                oDialog.addAriaDescribedBy("confirmDialogText1");
                                                return oDialog;
                                }
                };
}, true);


