sap.ui.define(["sap/ui/core/Fragment","sap/m/MessagePopover","sap/m/MessageItem","sap/ui/core/Core","sap/ui/core/message/Message","sap/ui/core/MessageType"],function(e,s,t,a,r,i){"use strict";var o={handleMessagePopoverPress:function(e){if(!this.oMP){this.MsgPopOverHdler.createMessagePopOver.apply(this)}this.oMP.toggle(e.getSource())},createMessagePopOver:function(){var e=this;this.oMP=new s({activeTitlePress:function(s){var t=s.getParameter("item");var a=t.getBindingContext("Messages").getObject();if(a.code==="DocCreated"){e.MsgPopOverHdler.navToBoListWithRefDoc.apply(e,[a])}else{if(a.code!=="SecondStep"){var r=e.getView().byId(a.target);r.setValueState("Error")}e.MsgPopOverHdler.navigateToWizardStep.apply(e,[a])}},items:{path:"Messages>/",template:new t({title:"{Messages>message}",subtitle:"{Messages>additionalText}",type:"{Messages>type}",description:"{Messages>description}",groupName:{parts:[{path:"Messages>"}],formatter:this.MsgPopOverHdler.getGroupName},activeTitle:true})}});this.oMP._oMessageView.setGroupItems(true);this.getView().byId("messagePopoverBtn").addDependent(this.oMP)},navigateToWizardStep:function(e){this.getView().byId("CreateProductWizard").goToStep(this.getView().byId(e.code));this.oMP.close()},getGroupName:function(e){var s="";switch(e.code){case"FirstStep":s="CREATION";break;case"SecondStep":s="AFFECTATION";break;default:}return s},addMessageWithTarget:function(e){this.MsgPopOverHdler.removeMsgWithTarget.apply(this,[e.sTarget]);this._MessageManager.addMessages(new r({message:e.sMsgTitle,type:e.sMsgType,description:e.sMsgDescription,additionalText:e.sAddText,target:e.sTarget,processor:e.oProcessor,code:e.code}))},removeMsgWithTarget:function(e){this._MessageManager.getMessageModel().getData().forEach(function(s){if(s.target===e){this._MessageManager.removeMessages(s)}}.bind(this))},removeAllMsgsByType:function(e){this._MessageManager.getMessageModel().getData().forEach(function(s){if(s.type===e){this._MessageManager.removeMessages(s)}}.bind(this))},navToBoListWithRefDoc:function(e){var s=e.getTarget();var t="";var a="";var r="";if(s){t="ZBureauDordre";a="display";r="?Zrefde="+s}var i=sap.ushell.Container.getService("CrossApplicationNavigation");var o=i&&i.hrefForExternal({target:{semanticObject:t,action:a}})||"";var g=window.location.href.split("#")[0]+o+r;sap.m.URLHelper.redirect(g,true)}};return o});