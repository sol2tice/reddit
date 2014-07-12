PearltreesHomeSpecial = {
		invitationType : -1,
		invitingUsername : null,
		invitingFacebookId : null,
		invitingPearltreesId : null,
		FACEBOOK_INVITE_PARAMETER : "fromFB=invite,",
		MAIL_INVITE_PARAMETER : "fromMail=invite,",
		
		setAvatar : function() {
			var imageUrl = PearltreesHomeSpecial.getInvitingAvatar();
			if (!PearltreesHomeSpecial.isFacebookInviteMode()) {
				$('.invitation-header-avatar').addClass('invitation-header-avatar-pearltrees');
				$('#signup-invitation-header-avatar-mask').removeClass('sprite-home-masque_avatar_home').addClass('sprite-home-masque_avatar_home52');
			}
			$('.invitation-header-avatar').css('background-image', 'url(' + imageUrl + ')');
		},
		
		setWelcomeMessage : function() {
			var invitingUsername = null;
			invitingUsername = PearltreesHomeSpecial.invitingUsername + $('.invitation-header-title').html();
			if (PearltreesHomeSpecial.invitationType == FacebookRequest.INVITATION_TEAM_UP_REDIRECTION_TYPE) {
				$('.invitation-default').hide();
				$('.invitation-teamup').show();
			}
			else {
				$('.invitation-default').show();
				$('.invitation-teamup').hide();
			}
			$('.invitation-header-title').text(invitingUsername);	
		},
		
		update : function() {
			PearltreesHomeSpecial.decodeInvitationContext();
			PearltreesHomeSpecial.setAvatar();
			PearltreesHomeSpecial.setWelcomeMessage();
		},
		
		getCurrentUrl : function() {
			return document.URL;
		},
		
		isSpecialSignupFb :function() {
			var currentUrl = PearltreesHomeSpecial.getCurrentUrl();
			var  inviteFBIndex = currentUrl.indexOf(PearltreesHomeSpecial.FACEBOOK_INVITE_PARAMETER);
			var  inviteMailIndex = currentUrl.indexOf(PearltreesHomeSpecial.MAIL_INVITE_PARAMETER);
			if (inviteFBIndex > 0 || inviteMailIndex > 0) {
				return true;
			}
			return false;
		},
		
		isFacebookInviteMode : function() {
			return PearltreesHomeSpecial.invitingFacebookId != null && PearltreesHomeSpecial.invitingFacebookId != "";
		},
		
		decodeInvitationContext : function() {
			var currentUrl = PearltreesHomeSpecial.getCurrentUrl();
			var  inviteFBIndex = currentUrl.indexOf(PearltreesHomeSpecial.FACEBOOK_INVITE_PARAMETER);
			var  inviteMailIndex = currentUrl.indexOf(PearltreesHomeSpecial.MAIL_INVITE_PARAMETER);
			if (inviteFBIndex > 0 || inviteMailIndex > 0) {
				var startIndex = (inviteFBIndex > 0 ? inviteFBIndex : inviteMailIndex) + (inviteFBIndex > 0 ? PearltreesHomeSpecial.FACEBOOK_INVITE_PARAMETER.length : PearltreesHomeSpecial.MAIL_INVITE_PARAMETER.length);
				var decodedText = PearltreesHomeSpecial.decodeBase64(currentUrl.substring(startIndex, currentUrl.length));
				var params = decodedText.split(",");
				PearltreesHomeSpecial.invitationType = params[0];
				PearltreesHomeSpecial.invitingUsername = params[1];
				PearltreesHomeSpecial.invitingFacebookId = params[2];
				PearltreesHomeSpecial.invitingPearltreesId = params[3];
				PearltreesInviteKey = params[4];
			}
		},
		
		getFacebookAvatar : function() {
			return FacebookAccount.getFacebookAvatarUrl(FacebookAccount.PROFILE_PICTURE_SQUARE, PearltreesHomeSpecial.invitingFacebookId);
		},
		
		getInvitingAvatar : function() {
			if (PearltreesHomeSpecial.isFacebookInviteMode()) {
				return PearltreesHomeSpecial.getFacebookAvatar();
			}
			else {
				return PearltreesSpecialHomeAvatar.getAvatarUrl(PearltreesHomeSpecial.invitingPearltreesId);
			}
		},
		
		decodeBase64 : function(encodedString) {
			//var test = CryptoJS.enc.Base64.parse(encodedString).toString(CryptoJS.enc.Base64);
			return CryptoJS.enc.Base64.parse(encodedString).toString(CryptoJS.enc.Latin1);
		}
}

FacebookAccount = {
		PROFILE_PICTURE_SQUARE : 0,
		PROFILE_PICTURE_SMALL : 1,
		PROFILE_PICTURE_NORMAL : 2,
		PROFILE_PICTURE_LARGE : 3,
		
		getFacebookAvatarUrl : function(pictureFormat, facebookId) {
			var url = "http://graph.facebook.com/" + facebookId + "/picture?";
			switch (pictureFormat) {
			case FacebookAccount.PROFILE_PICTURE_SQUARE:
				url += "type=square";
				break;
			case FacebookAccount.PROFILE_PICTURE_SMALL:
				url += "type=small";
				break;
			case FacebookAccount.PROFILE_PICTURE_NORMAL:
				url += "type=squnormalare";
				break;
			case FacebookAccount.PROFILE_PICTURE_LARGE:
				url += "type=large";
				break;
			}
			return url;
		}
}

FacebookRequest = {
		INVITATION_INSCRIPTION_REDIRECTION_TYPE : 1, //Same as defined on the server side in FbRedirection 
		INVITATION_TEAM_UP_REDIRECTION_TYPE : 2
}

PearltreesSpecialHomeAvatar = {
		getAvatarUrl : function(userId) {
			return PearltreesHomeCommon.getServicesUrl() + "/avatar/getUserAvatarUrl?userId=" + userId;
		}
}
