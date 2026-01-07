sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History", "sap/m/MessageBox", 'sap/ui/model/Filter',
    "sap/ui/model/FilterOperator", "sap/ui/model/json/JSONModel", "sap/ui/core/Fragment", "sap/m/UploadCollectionParameter",
    "sap/m/MessageToast","sap/m/UploadCollectionParameter",
], function (e, t, MessageBox, Filter, FilterOperator, JSONModel, Fragment, r,MessageToast,UploadCollectionParameter) {
    "use strict";
    return e.extend("zfibudgetreq.controller.BaseController", {
        onInit() {
            
        },
        getRouter: function () {
            return this.getOwnerComponent().getRouter()
        },
        getModel: function (e) {
            return this.getView().getModel(e)
        },
        setModel: function (e, t) {
            return this.getView().setModel(e, t)
        },
        showBusy: function (bBusy) {
            if (bBusy) {
                sap.ui.core.BusyIndicator.show(0);
            } else {
                sap.ui.core.BusyIndicator.hide();
            }
        },
        getText: function (sProperty, aArgs) {
            if (!this._oResourceBundle) {
                this._oResourceBundle = this.getModel("i18n").getResourceBundle();
            }
            return this._oResourceBundle.getText(sProperty, aArgs);
        },

        getResourceBundle: function (sText) {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle()
        },

        onCloseFundsCenter: function (oEvent) {
            this.irowindex = '';
            this.FCTEXT.close();
        },

        onCloseCommitmentItem: function (oEvent) {
            this.irowindex1 = '';
            this.CMTEXT.close();
        },
        onOpenPernr: function (oEvent) {
            if (!this.dPernr) {
                this.dPernr = sap.ui.xmlfragment("zfibudgetreq.fragment.Pernr", this);
                this.getView().addDependent(this.dPernr);
            };            
            this.getOdata("/EMPDTSet","userdetails",null);
            this.dPernr.open();
        },

        onOpenFundsctr: function (oEvent) {
            var irow = oEvent.getParameter("id").split("-");
            var irowindex = irow[irow.length-1];
            this.irowindex = irowindex;
            if (!this.FCTEXT) {
                this.FCTEXT = sap.ui.xmlfragment("zfibudgetreq.fragment.FundsCenter", this);
                this.getView().addDependent(this.FCTEXT);
            };            
            var oFilter1 = new sap.ui.model.Filter("Mctxt", sap.ui.model.FilterOperator.EQ, this.getOwnerComponent().getModel("create").getData().results.Pernr);
            this.getOdata("/FCTEXTSet","FundsCenter",oFilter1);
            this.FCTEXT.open();
        },
        onOpenCmmtitem: function (oEvent) {
            var irow = oEvent.getParameter("id").split("-");
            var irowindex = irow[irow.length-1];
            this.irowindex1 = irowindex;
            if (!this.CMTEXT) {
                this.CMTEXT = sap.ui.xmlfragment("zfibudgetreq.fragment.CommitmentItem", this);
                this.getView().addDependent(this.CMTEXT);
            };            
            this.getOdata("/CMTEXTSet","CommitmentItem",null);
            this.CMTEXT.open();
        },
        onValidation:function(ovalue){
            var bflag = true;
            
            // else if(ovalue.Docdate === null || ovalue.Docdate === ''){
            //     MessageBox.error("Please enter Document Date");
            //     bflag = false;
            // }
             if(ovalue.Pernr === null || ovalue.Pernr === ''){
                MessageBox.error("Please enter Employee Number");
                bflag = false;
            }
            else if(ovalue.Btext === null || ovalue.Btext === ''){
                MessageBox.error("Please enter Description");
                bflag = false;
            }
            else if(ovalue.Process === null || ovalue.Process === ''){
                MessageBox.error("Please select Process Type");
                bflag = false;
            }
           
            else if(ovalue.Docyear === null || ovalue.Docyear === '' || ovalue.Docyear === '0000'){
                MessageBox.error("Please enter Document Year");
                bflag = false;
            }
           
            // else if(this.getModel("UploadAttachmentModel").getData().ATTACHSet === undefined){
            //     MessageBox.error("Attachment is mandatory");
            //     bflag = false;
            // }
            // else if(this.getModel("UploadAttachmentModel").getData().ATTACHSet !== undefined
            //     && this.getView().byId("idUploadCollectionAttachments").getItems().length === 0){
            //     MessageBox.error("Attachment is mandatory");
            //     bflag = false;
            // }
            // else if(this.getModel("UploadAttachmentModel").getData().ATTACHSet !== undefined
            //     && this.getOwnerComponent().getModel("attachflag").getProperty("/flag") !== undefined
            //      && this.getOwnerComponent().getModel("attachflag").getProperty("/flag") === ''){
            //     MessageBox.error("Attachment is mandatory");
            //     bflag = false;
            // }
            else if(this.getView().getModel("item").getData().results === undefined){
                MessageBox.error("Please enter Funds Center");
                bflag = false;
            }
            else if(this.getView().getModel("item").getData().results !== undefined){
                this.getView().getModel("item").getData().results.forEach(function (item, index) {
                    if(item.Fundsctr === ''){
                        MessageBox.error("Please enter Funds Center");
                        bflag = false;
                    }
                    else if(item.Cmmtitem === ''){
                        MessageBox.error("Please enter Commitment Item");
                        bflag = false;
                    }
                    else if(item.Amt !== ''){
                        var fval = parseFloat(item.Amt);
                        if(fval === 0){
                            MessageBox.error("Please enter Amount");
                            bflag = false;
                        }
                        else if(fval < 0){
                            MessageBox.error("Amount cannot be negative");
                            bflag = false;
                        }
                    }                    
                    else if(item.Amt === '' ){
                        MessageBox.error("Please enter Amount");
                        bflag = false;
                    }
                });
            }
           
            return bflag;
        },
        onSaveTaxCode: function (oEvent) {
            var oPayload = this.getOwnerComponent().getModel("display").getData().results;
            oPayload.BudgetToItem = this.getOwnerComponent().getModel("item").getData().results;            
            this.showBusy(true);
            
            this.getModel().create("/BUDREQSet", oPayload, {
                method: "POST",
                success: function (oData, res) {
                    this.showBusy(false);
                    if (oData.Breqno !== '') {                       
                        var sMsg ="Tax Code for Claim No." + oData.Breqno + " saved Successfully ";
                        MessageBox.success(sMsg);
                    } else {
                        var msg = JSON.parse(res.headers["sap-message"]).message;
                        MessageBox.error(msg);
                    }

                }.bind(this),
                error: function (oError) {

                    this.showBusy(false);
                    var msg = JSON.parse(oError.responseText).error.message.value;
                    MessageBox.error(msg);
                }.bind(this)
            });
            // var sBreqno = this.getView().getModel("display").getData().results.Breqno;
            // var xnavservice = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService && sap.ushell.Container.getService("CrossApplicationNavigation");
            // var href = (xnavservice && xnavservice.hrefForExternal({
            //     target: { semanticObject: "zfiempclaimapp", action: "approve" },
            //     params: { "Breqno": sBreqno }
            // })) || "";
            // 
            // if (href.indexOf("&sap-app-origin-hint=") !== -1) {
            //     href.replaceAll("&sap-app-origin-hint=", "");
            // }
            // var sval = href.split("?");

            // var finalUrl = window.location.href.split("#")[0] + "&"+sval[1]+sval[0];
            // 
            // sap.m.URLHelper.redirect(finalUrl, true);

        },
        onSearchPernr: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.Contains, sValue);
            oEvent.getSource().getBinding("items").filter([oFilter]);
        },
        onSearchFundsCenter: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new sap.ui.model.Filter("Fictr", sap.ui.model.FilterOperator.EQ, sValue);
            var oFilter1 = new sap.ui.model.Filter("Mctxt", sap.ui.model.FilterOperator.EQ, this.suser); 
            this.getOdata("/FCTEXTSet","FundsCenter", [oFilter,oFilter1]);
        },
        onSearchCommitmentItem: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new sap.ui.model.Filter("Fipex", sap.ui.model.FilterOperator.EQ, sValue);
            this.getOdata("/CMTEXTSet","CommitmentItem",[oFilter]);
        },
        ongetActualAvl:function(sfund,scomm,iindx){
            var syear = this.getOwnerComponent().getModel("create").getData().results.Docyear;
            var surl = "/BUDAVBSet(Fundsctr='" + sfund + "',Cmmtitem='" + scomm + "',Fyear='" + syear + "')";
            this.getOdata(surl,"",null).then((res) => {
                this.getView().byId("itemtable").getItems()[iindx].getCells()[8].setText(res.Amt);
                this.getView().byId("itemtable").getItems()[iindx].getCells()[5].setText(res.Curr);
            });
        },
        onpostingdate:function(e){
            var sdate = new Date(e.getSource().getProperty("dateValue"));
            this.getdocyear(sdate);
        },
        getdocyear:function(sdate){
            var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "yyyy-MM-ddTHH:mm:ss"
            });
            var sdate1 = dateFormat.format(sdate);
            var sdate2=sdate1.replaceAll(":","%3A");
            var surl = "/FYEARSet(Docdate=datetime'" + sdate2 + "')";
            this.getOdata(surl,"",null).then((res) => {
                this.getOwnerComponent().getModel("create").getData().results.Docyear = res.Docyear;
                this.getOwnerComponent().getModel("create").refresh(true);
            });
        },
        onPressDisplay: function (oEvent) {
            var suser = '';
            if(sap.ushell !== undefined){
                suser = sap.ushell.Container.getService("UserInfo").getId();
            }
            var sValue = this.getView().getModel("display").getData().results.Breqno;
            
            var oFilter = new sap.ui.model.Filter("Breqno", sap.ui.model.FilterOperator.EQ, sValue);
           //(Breqno='" + sValue + "',Pernr='" + sLotNo + "')
           if(sValue === ''){
            MessageBox.error("Please enter Claim no");
           }else{
            //this.getOdata("/BUDREQSet(Breqno='" + sValue + "')","display", null);
            this.getOdata("/BRWRLOGSet","approvallog", oFilter);
            this.getOdata("/BUDREQSet(Breqno='" + sValue + "')","display", null,true).then((response) => {
                if(response.Status === 'RE' && suser === response.Crtby){
                    this.getOwnerComponent().getModel("create").setProperty("/results", response);
                    var sstr2 = {
                        "create": true,
                        "display": false,
                        "onbehalf":false,
                        "emp":true,
                    }
    
                    this.getOwnerComponent().getModel("ViewVis").setProperty("/data", sstr2);
                    this.getOwnerComponent().getModel("ViewVis").refresh(true);
                    this.getResourceBundle().aPropertyFiles[0].mProperties.appTitle = "SACC Budget Initiation/Supplementary";
                    //this.getResourceBundle().refresh(true);
                }
                else{
                    var sstr2 = {
                        "create": false,
                        "display": true,
                        "onbehalf":false,
                        "emp":false,
                    }
                    this.getOwnerComponent().getModel("ViewVis").setProperty("/data", sstr2);
                    this.getOwnerComponent().getModel("ViewVis").refresh(true);
                    this.getResourceBundle().aPropertyFiles[0].mProperties.appTitle = "SACC Budget Initiation/Supplementary Display";
                    //this.getResourceBundle().refresh(true);
                }
            });
            //this.readAllAttachmentData('', '',sValue);
           }
            
        },
        ongetpernr:function(e){
            this.ongetpernrdtls(e.getParameter("value"));
        },
        ongetpernrdtls:function (spernr){
            var oFilter = new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, spernr);
            this.getOdata("/EMPDTSet(Pernr='" + spernr + "')","user", null).then((res1) => {
                this.getOwnerComponent().getModel("create").getData().results.Kostl = res1.Kostl;
                this.getOwnerComponent().getModel("create").getData().results.Ktext = res1.Ktext;
                this.getOwnerComponent().getModel("create").getData().results.Dept = res1.Dept;
                this.getOwnerComponent().getModel("create").getData().results.Dtext = res1.Dtext;
                this.getOwnerComponent().getModel("create").getData().results.Divis = res1.Divis;
                this.getOwnerComponent().getModel("create").getData().results.Ditxt = res1.Ditxt;
                this.getOwnerComponent().getModel("create").getData().results.Pernr = res1.Pernr;
                this.getOwnerComponent().getModel("create").getData().results.Perna = res1.Perna;
                this.getOwnerComponent().getModel("create").refresh(true);
            });
        },
        oncheckbox: function (e) {
            debugger;
            if(e.getParameter("selected") === false){
                
            this.suser = '';
            if(sap.ushell !== undefined){
                this.suser = sap.ushell.Container.getService("UserInfo").getId();
            }
            //this.suser = '12002795';
             this.getOdata("/CRTDETSet(Crtby='" + this.suser + "')", "user", null).then((res) => {
                    this.ongetpernrdtls(res.Pernr);
                 });
                }
        },
        handleValueHelpPernr: function (e) {
           this.ongetpernrdtls(e.getParameter("selectedItem").getProperty("title"));
        },
        handleValueHelpCommitmentItem: function (e) {
            this.getView().byId("itemtable").getItems()[this.irowindex1].getCells()[3].setValue(e.getParameter("selectedItem").getProperty("title"));
            this.getView().byId("itemtable").getItems()[this.irowindex1].getCells()[4].setText(e.getParameter("selectedItem").getProperty("description"));
            

            var oitem = this.getView().byId("itemtable").getItems()[this.irowindex1];
            if(oitem.getCells()[1].getValue() !== ''
            && oitem.getCells()[3].getValue() !== ''){
                this.ongetActualAvl(oitem.getCells()[1].getValue(),oitem.getCells()[3].getValue(),this.irowindex1);
            }
            this.irowindex1 = '';
        //     var oFilter = new sap.ui.model.Filter("Fipex", sap.ui.model.FilterOperator.EQ, e.getParameter("selectedItem").getProperty("title"));
        //    this.showBusy(true);
        //     this.getView().getModel().read("/CMTEXT(Fipex='" + e.getParameter("selectedItem").getProperty("title") + "')", {
        //            // filters: [oFilter],
        //             success: function (oData) {
        //                 this.showBusy(false);
        //                 this.getView().byId("itemtable").getItems()[this.irowindex1].getCells()[4].setValue(oData.Fipex);
        //                 this.getView().byId("itemtable").getItems()[this.irowindex1].getCells()[5].setText(oData.Bezei);
                       
        //                 this.irowindex1 = '';
        //             }.bind(this),
        //             error: function (oError) {
        //                 this.showBusy(false);
        //             }.bind(this)
        //         });
           
            
        },
        handleValueHelpFundsCenter: function (e) {
        this.getView().byId("itemtable").getItems()[this.irowindex].getCells()[1].setValue(e.getParameter("selectedItem").getProperty("title"));
        this.getView().byId("itemtable").getItems()[this.irowindex].getCells()[2].setText(e.getParameter("selectedItem").getProperty("description"));
       
        var oitem = this.getView().byId("itemtable").getItems()[this.irowindex];
        if(oitem.getCells()[1].getValue() !== ''
            && oitem.getCells()[3].getValue() !== ''){
                this.ongetActualAvl(oitem.getCells()[1].getValue(),oitem.getCells()[3].getValue(),this.irowindex);
            }
          this.irowindex = '';   
        //     var oFilter = new sap.ui.model.Filter("Fictr", sap.ui.model.FilterOperator.EQ, e.getParameter("selectedItem").getProperty("title"));
        //    this.showBusy(true);
        //     this.getView().getModel().read("/FCTEXTSet(Fictr='" + e.getParameter("selectedItem").getProperty("title") + "')", {
        //            // filters: [oFilter],
        //             success: function (oData) {
        //                 this.showBusy(false);
        //                 this.getView().byId("itemtable").getItems()[this.irowindex].getCells()[1].setValue(oData.Fictr);
        //                 this.getView().byId("itemtable").getItems()[this.irowindex].getCells()[2].setText(oData.Bezeich);
                        
        //                 this.irowindex = '';
        //             }.bind(this),
        //             error: function (oError) {
        //                 this.showBusy(false);
        //             }.bind(this)
        //         });
           
            
        },
        formatstatusapp: function (sText) {
            var sTxt = '';
            if (sText === 'SAVE' || sText === 'IN' || sText === 'SU') {
                sTxt = 'In Process';
            } else if (sText === 'SUFA') {
                sTxt = 'Submitted for Approval';
            }
            else if (sText === 'AP') {
                sTxt = 'Approved';
                
            } else if (sText === 'RE') {
                sTxt = 'Reopen';
            }
            else if (sText === 'RJ') {
                sTxt = 'Rejected';
            }else if (sText === 'PO') {
                sTxt = 'Posted';
            }

            return sTxt;
        },
        timeformat: function (val) {
            if(val !== null){
            if (typeof val === 'string' || val instanceof String) {
                val = val.replace(/^PT/, '').replace(/S$/, '');
                val = val.replace('H', ':').replace('M', ':');

                var multipler = 60 * 60;
                var result = 0;
                val.split(':').forEach(function (token) {
                    result += token * multipler;
                    multipler = multipler / 60;
                });
                var timeinmiliseconds = result * 1000;

                var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
                    pattern: "KK:mm:ss a"
                });
                var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
                return timeFormat.format(new Date(timeinmiliseconds + TZOffsetMs));
            } else {
                val = val.ms;
                var ms = val % 1000;
                val = (val - ms) / 1000;
                var secs = val % 60;
                val = (val - secs) / 60;
                var mins = val % 60;
                var hrs = (val - mins) / 60;

                return hrs + ':' + mins + ':' + secs;
            }
        }
        },
        DateFormatStr: function (oVal) {
            if(oVal !== null){
            if (typeof oVal === 'string' || oVal instanceof String) {
                return oVal.substr(8, 2) + "-" + oVal.substr(5, 2) + "-" + oVal.substr(0, 4);
            } else if (oVal instanceof Date) {
                var sDate = oVal.toJSON();
                return sDate.substr(8, 2) + "-" + sDate.substr(5, 2) + "-" + sDate.substr(0, 4);

            }
        }
        },
        getOdata: function (surl, smodelname, ofilter,sexpand) {
            var sparam = '';               
                if(sexpand !== undefined && sexpand === true){
                    sparam = "BudgetToItem";
                }
            return new Promise((resolve, reject) => {
            if (ofilter === null) {
                this.showBusy(true);
                this.getOwnerComponent().getModel().read(surl, {
                    urlParameters: {
                        "$expand": sparam
                    },
                    success: function (oData) {
                        this.showBusy(false);
                        if(smodelname !== ''){
                        if(oData.results !== undefined  ){
                            this.getModel(smodelname).setProperty("/results", oData.results);
                            resolve(oData.results);
                        }else{
                            if(oData.Status !== undefined && oData.Status !== 'RE' 
                                && oData.Status !== '' &&
                                window.location.href.indexOf("zfibudgetreq-create") !== -1 )
                                {
                                this.getOdata("/BUDREQSet(Breqno='')", smodelname, null,true)
                            }else{
                                this.getModel(smodelname).setProperty("/results", oData);
                            }
                            
                            if(oData.BudgetToItem !== undefined && oData.BudgetToItem.results.length > 0){
                                oData.BudgetToItem.results.forEach(function (item, index) {
                                    if(item.Amt === '0.000'){
                                        item.Amt = '';
                                    }                                    
                                });
                                this.getModel("item").setProperty("/results", oData.BudgetToItem.results);
                            }                           
                            
                        }
                        }
                        
                            resolve(oData);
                    }.bind(this),
                    error: function (oError) {
                        this.showBusy(false);
                        var msg = JSON.parse(oError.responseText).error.message.value;
                        MessageBox.error(msg);                    
                        reject();
                    }.bind(this)
                });
            } else {
                this.showBusy(true);
                this.getOwnerComponent().getModel().read(surl, {
                    filters: [ofilter],
                    success: function (oData) {
                        this.showBusy(false);
                        if(oData.results !== undefined){
                            this.getModel(smodelname).setProperty("/results", oData.results);
                            resolve(oData.results);
                        }else{
                            this.getModel(smodelname).setProperty("/results", oData);
                            resolve(oData);
                        }
                    }.bind(this),
                    error: function (oError) {
                        this.showBusy(false);
                        var msg = JSON.parse(oError.responseText).error.message.value;
                        MessageBox.error(msg); 
                        reject();
                    }.bind(this)
                });
            }
        });
        },
        ondisplayAttachments: function (oEvent) {
            var e = 'AT';
            var t = this.getView(),
                a = this.getModel("i18n");
         //   this._oAttachmentDialog = t.byId("idDialogUploadAttachments11");
            var LabelText = e;
            if (!this._oAttachmentDialog) {
                this._oAttachmentDialog = sap.ui.xmlfragment(t.getId(), "zfibudgetreq.fragment.DisplayAttachments", this);
                t.addDependent(this._oAttachmentDialog)
            }
            jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oAttachmentDialog);
            this.getView().setBusy(true);
            var sBreqno = this.getOwnerComponent().getModel("display").getData().results.Breqno;
            this.readAllAttachmentData(e, 'X',sBreqno);
            var i = this.getOwnerComponent().getModel("UploadAttachmentModel");
            i.setData({
                ATTACHSet: []
            })
            this._oAttachmentDialog.open();
        },
        onUploadAttachments: function (oEvent) {
            var e = 'AT';
            var t = this.getView(),
                a = this.getModel("i18n");
          //  this._oAttachmentDialog = t.byId("idDialogUploadAttachments");
            var LabelText = e;
            if (!this._oAttachmentDialog) {
                this._oAttachmentDialog = sap.ui.xmlfragment(t.getId(), "zfibudgetreq.fragment.UploadAttachments", this);
                t.addDependent(this._oAttachmentDialog)
            }
            jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oAttachmentDialog);
            this.getView().setBusy(true);
            var sBreqno = this.getOwnerComponent().getModel("create").getData().results.Breqno;
            this.readAllAttachmentData(e, 'X',sBreqno);
            var i = this.getOwnerComponent().getModel("UploadAttachmentModel");
            i.setData({
                ATTACHSet: []
            })
            this._oAttachmentDialog.open();
        },
        readAllAttachmentData: function (e, bflag,sBreqno) {
            var t = this.getModel("AttachmentType").Breqno,
                r = this.getOwnerComponent().getModel(),
                surll = "/ATTACH1Set",
                s = [],
                sListType = e;

            if(sBreqno !== undefined){
                t = sBreqno;
            }
            s.push(new Filter("Breqno", FilterOperator.EQ, t));
           

            var n = this;
            n.getView().setBusy(true);
            r.read(surll, {
                filters: s,
                success: function (e, t) {
                    n.getView().setBusy(false);                    
                    if (bflag !== '') {
                        n._OpenAttachmentDialog(e);
                    }
                },
                error: function (e, t) {
                    n.getView().setBusy(false)
                }
            })
        },
        onFileDeletedListData: function (e) {
            var t = e.getParameter("documentId");
            var a = this.getModel("AttachmentType").Breqno;
            var i = this.getModel();
            var r = this.getModel("UploadAttachmentModel").getProperty("/ATTACHSet");
            var o = r[0].Uname;
            var sListType = this.getModel("AttachmentType").sListType;
            var sLotno = this.getModel("AttachmentType").LotNo;
            if (sListType === "AT" || sListType === "SI") {
                sLotno = '000';
            }

            i.remove("/ATTACHSet(Breqno='" + a + "',DocId='" + t + "',Uname='" + o + "')", {
                success: function () {
                        // this.AttachmentType.checkAttachmentData = "X";

                        this.readAllAttachmentData(sListType, 'X');
                    }
                    .bind(this),
                error: function (e) {
                    sap.m.MessageBox.error("Delete Failed")
                }
            })
        },
        _OpenAttachmentDialog: function (e) {

            var t = [],
                a = this.getModel("AttachmentType").Breqno,
                i = this.getOwnerComponent().getModel("UploadAttachmentModel"),
                r = {},
                sBreqno=this.getOwnerComponent().getModel("create").getData().results.Breqno,
                surl = '';
            i.setData([]);
            for (var o = 0; o < e.results.length; o++) {
                surl = "/sap/opu/odata/sap/ZFI_BUDGET_REQ_SRV/ATTACHSet(Breqno='" + e.results[o].Breqno + "',Zlevel=" + e.results[o].Zlevel + ",Serial=" + e.results[o].Serial + ")/$value";
                r = {
                    DocId: e.results[o].Serial,
                    FileName: e.results[o].FileName,
                    ProjectCode: "",
                    Mandt: "",
                    Mimetype: e.results[o].Mimetype,
                    Breqno: e.results[o].Breqno,
                    Serial: e.results[o].Serial,
                    UpldBy: e.results[o].UpldBy,
                    UploadedOn: e.results[o].UpldDat,
                    Uname: e.results[o].UpldBy,
                    Url: surl
                };
                t.push(r)
            }
            i.setData([]);
            i.setData({
                ATTACHSet: t
            });
            this.getView().setBusy(false);
            
        },
        onHandleCancelUpload1: function (e) {
            this._oAttachmentDialog.close();
         },
        onHandleCancelUpload: function (e) {
            this._oAttachmentDialog.close();
        },

        //BOC-EX-GOME
        _getBaseURL: function () {
            var e = this.getOwnerComponent()
                .getManifestEntry("/sap.app/id")
                .replaceAll(".", "/");
            return jQuery.sap.getModulePath(e);
        },
        //EOC-EX-GOME

        onBeforeUploadStartsListData: function (e) {
            var sBreqno = this.getOwnerComponent().getModel("create").getData().results.Breqno ,
                sListType = this.getModel("AttachmentType").sListType,
                a = this.getModel("i18n");
                
            var szlevel = '0';
            if(this.sserial !== undefined ){
                this.sserial = this.sserial + 1;
            }else{
                this.sserial = 0;
            }
            var sserial = (this.sserial).toString();
            var i = new sap.m.UploadCollectionParameter({
                name: "slug",
                value: e.getParameter("fileName") + "|" + sBreqno + "|" + szlevel + "|" + sserial //add lot no after t
            });
            var o = new sap.m.UploadCollectionParameter({
                name: "X-Requested-With",
                value: "XMLHttpRequest"
            });
            var s = new sap.m.UploadCollectionParameter({
                name: "Content-Disposition",
                value: e.getParameter("fileName")
            });
            var n = new sap.m.UploadCollectionParameter({
                name: "Content-Type",
                value: "application/octet-stream"
            });
            e.getParameters().addHeaderParameter(i);
            e.getParameters().addHeaderParameter(n);
            e.getParameters().addHeaderParameter(o);
            e.getParameters().addHeaderParameter(s)
        },
        onUploadCompleteListData: function (e) {
            this.readAllAttachmentData(this.getModel("AttachmentType").sListType, 'X');
        },
        onChangeListData: function (e) {
            //BOC-EX-GOME
            var sregex = /^[0-9a-zA-Z ... ]+$/;
            var ofile = e.mParameters.files[0].name.split(".");
            this.sfile = e.mParameters.files[0].name;
            if(ofile.length > 2){
                sap.m.MessageBox.error("Invalid Filename", {
                    initialFocus: sap.m.MessageBox.Action.CANCEL,
                    onClose: function (sButton) {
                        if (sButton == "CLOSE") {
                            this.getView().byId("idUploadCollectionAttachments").getItems().forEach(function (item,idx) {
                               if(item.mProperties.fileName === this.sfile){
                                this.getView().byId("idUploadCollectionAttachments").removeItem(idx);
                               }
                            }.bind(this));
                        }}.bind(this)});
    
                return;
            }
            
            this.getOwnerComponent().getModel("attachflag").setProperty("/flag", 'X');
            var t = "/sap/opu/odata/sap/ZFI_BUDGET_REQ_SRV",
                //EOC-EX-GOME
                a = {
                    "X-Requested-With": "XMLHttpRequest",
                    "Content-Type": "application/atom+xml",
                    "X-CSRF-Token": "Fetch"
                },
                i = new sap.ui.model.odata.ODataModel(t, "false", "", "", a, true);
            sap.ui.getCore().setModel(i, "XCRFTokenModel");
            sap.ui.getCore().getModel("XCRFTokenModel").refreshSecurityToken();
            var r = sap.ui.getCore().getModel("XCRFTokenModel").getHeaders()["x-csrf-token"],
                o = e.getSource(),
                s = new sap.m.UploadCollectionParameter({
                    name: "x-csrf-token",
                    value: r
                });
            o.addHeaderParameter(s)
        },
        onChange: function(oEvent) {
			var oUploadCollection = oEvent.getSource();
			// Header Token
			var oCustomerHeaderToken = new UploadCollectionParameter({
				name: "x-csrf-token",
				value: "securityTokenFromModel"
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
			//MessageToast.show("Event change triggered");
		},

		onFileDeleted: function(oEvent) {
			//MessageToast.show("Event fileDeleted triggered");
		},

		onFilenameLengthExceed: function(oEvent) {
			//MessageToast.show("Event filenameLengthExceed triggered");
		},

		onFileSizeExceed: function(oEvent) {
			//MessageToast.show("Event fileSizeExceed triggered");
		},

		onTypeMissmatch: function(oEvent) {
			//MessageToast.show("Event typeMissmatch triggered");
		},

		onStartUpload: function(oEvent) {
			var oUploadCollection = this.byId("idUploadCollectionAttachments");
            
			var cFiles = oUploadCollection.getItems().length;
			var uploadInfo = cFiles + " file(s)";

			if (cFiles > 0) {
				oUploadCollection.upload();

				
			}
		},

		onBeforeUploadStarts: function(oEvent) {
			// Header Slug
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
			setTimeout(function() {
				MessageToast.show("Event beforeUploadStarts triggered");
			}, 4000);
		},

		onUploadComplete: function(oEvent) {
			var sUploadedFileName = oEvent.getParameter("files")[0].FileName;
			setTimeout(function() {
				var oUploadCollection = this.byId("UploadCollection");

				for (var i = 0; i < oUploadCollection.getItems().length; i++) {
					if (oUploadCollection.getItems()[i].getFileName() === sUploadedFileName) {
						oUploadCollection.removeItem(oUploadCollection.getItems()[i]);
						break;
					}
				}

				// delay the success message in order to see other messages before
				MessageToast.show("Event uploadComplete triggered");
			}.bind(this), 8000);
		},

		onSelectChange: function(oEvent) {
			var oUploadCollection = this.byId("UploadCollection");
			oUploadCollection.setShowSeparators(oEvent.getParameters().selectedItem.getProperty("key"));
		}
    });
});