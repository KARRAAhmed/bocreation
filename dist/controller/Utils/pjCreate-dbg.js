sap.ui.define([
	"sap/ui/core/Fragment",
	"sap/m/MessagePopover",
	"sap/m/MessageItem",
	"sap/ui/core/Core",
	"sap/ui/core/message/Message",
	"sap/ui/core/MessageType"
], function (Fragment, MessagePopover, MessageItem, Core, Message, MessageType) {
	"use strict";

	var MsgHandlerModule = {
		onBeforeUploadStarts: function (oEvent) {
			var sNewDocRef = this.sNewDocId;
			var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);

			var oModel = this.getView().getModel();

			oModel.refreshSecurityToken();

			var oHeaders = oModel.oHeaders;

			var sToken = oHeaders["x-csrf-token"];

			var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({

				name: "x-csrf-token",

				value: sToken

			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderToken);
			var oCustomerHeaderDocId = new sap.m.UploadCollectionParameter({

				name: "slug",

				value: "Zrefde=" + sNewDocRef

			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderDocId);

		},
		onUploadComplete: function (oEvent) {
			var oUploadCollection = this.getView().byId("pjUploader");
			if (oUploadCollection._aFileUploadersForPendingUpload.length === 0) {
				this.getOwnerComponent().getEventBus().publish("BoChannel", "uploadComplete");
			}
		},
		uploadFilesFromPC: function (sDocRef) {
			this.sNewDocId = sDocRef;
			var oUploadCollection = this.getView().byId("pjUploader");
			oUploadCollection.upload();
			/*var that = this;
			var uploadPromise = new Promise(function (resolve, reject) {
				var oUploadCollection = that.getView().byId("pjUploader");
				if (oUploadCollection.hasPendingUploads()) {
					that.getOwnerComponent().getEventBus().publish("BoChannel", "uploadStarted");
					that.getOwnerComponent().getEventBus().subscribe("BoChannel", "uploadComplete", function () {
						that._resolve();
					}, that);
					oUploadCollection.upload();
				} else {
					resolve();
				}
			});
			return uploadPromise;*/

		}
	};
	return MsgHandlerModule;
});