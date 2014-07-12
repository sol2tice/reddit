if (!window['$t']) {
	$t = $;
}
PearltreesHomeSign = {

		currentPage : "signup_page",
		carouselTimeOut : null,
		isAutoSlidingDisabled : false,
		carouselDelay : 7000,
		showLoaderButtonSignUp : false,
		showLoaderButtonLogin : false,
		form: null, 
		validator: null,
		isUsernameTaken: false,
		hasArrivalPage: false,

		getUsernameTakenUrl : function()  {
			return '/api/username_available.json'; 
		},

		getSignUpUrl : function() {
			return PearltreesHomeCommon.getServicesUrl() + "/loginapi/createAccount";
		},

		getSignUpFromExternalServiceUrl : function() {
			return PearltreesHomeCommon.getServicesUrl() + "/loginapi/createAccountFromExternalService";
		},

		getLogUserUrl : function () {
			return PearltreesHomeCommon.getServicesUrl() + "/loginapi/logUser";
		},

		fieldsToValidate : ["username", "password",	"email"],

		getDefaultMessage: function(field) {
			var spec = PearltreesHomeSign.specificMessages[field];
			return spec ? spec : '';
		},
		raiseCommandEvent: function(commandName, params) {

			var element = document.getElementsByTagName("flexCommandEvent")[0];
			if (typeof element == 'undefined') {
				element = document.createElement("flexCommandEvent");
			}

			element.setAttribute("commandName", commandName);

			for(var index in params) {
				element.setAttribute(index, params[index]);
			}
			document.documentElement.appendChild(element);

			if (document.createEvent) {
				var evt = document.createEvent("Events");
				evt.initEvent("flexCommandEvent", true, false);
				element.dispatchEvent(evt);
			}
		},

		specificMessages: {},

		showPage : function showPage(page) {
			$('#signin_button').hide();
			if (this.hasArrivalPage) {
				this.hasArrivalPage = false;
				return;
			}
			$t(".form_page").hide();
			if (page == "special-home-invitation-page") {
				$t('#signin-container').css('margin-top', '-23px');
			}
			else {
				$t('#signin-container').css('margin-top', '0px');
			}
			$t("#"+page).show();
			$t("input:text:visible:first").focus();
			PearltreesHomeSign.currentPage = page;
		},

		initTextFieldKeyPress : function() {
			$t("#log_username").keydown(function (e) {
				PearltreesHomeSign.delayCarousel();
				if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
					$t('#log_password').focus();
					return false;
				} else {
					return true;
				}
			});
			$t("#log_password").keydown(function (e) {
				PearltreesHomeSign.delayCarousel();
				if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
					PearltreesHomeSign.submitLogInForm();
					return false;
				} else {
					return true;
				}
			});
			$t("#username").keydown(function (e) {
				PearltreesHomeSign.delayCarousel();
				if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
					$t('#email').focus();
					return false;
				} else {
					return true;
				}
			});
			$t("#email").keydown(function (e) {
				PearltreesHomeSign.delayCarousel();
				if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
					$t('#password').focus();
					return false;
				} else {
					return true;
				}
			});
			$t("#password").keydown(function (e) {
				PearltreesHomeSign.delayCarousel();
				if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
					$t('#signup_form').submit();
					return false;
				} else {
					return true;
				}
			});
		},

		initFormsValidation : function(formName, fieldsToValidate) {
			for (var i = 0; i<(fieldsToValidate.length);i++) {
				var field = fieldsToValidate[i];

				$t("input[id$='" + field + "']").on('focusin', function(inputField) {
					return function () {
                        $t("#" + inputField + "_error").html("");
                        $t("#" + inputField + "_info").html(PearltreesHomeSign.getDefaultMessage(inputField));
					}
				}(field));
				$t("input[id$='" + field + "']").on('focusout', function(inputField) {
					return function () {
						$t("#" + inputField + "_info").html('');
					}
				}(field));
			}
			this.form = $t(formName);
			this.validator = this.form.validate(
					{
						onkeyup: false,
						rules: {
							username: {
								minlength: 3,
								maxlength: 40,
								required: true
							},
							socialusername: {
								minlength: 3,
								maxlength: 40,
								required: true
							},
							email: {
								required: true,
								maxlength: 255,
								email: true
							},
							socialemail: {
								required: true,
								maxlength: 255,
								email: true
							},
							password: {
								minlength: 5,
								required: true
							},
							socialpassword: {
								minlength: 5,
								required: true
							}
						},
						messages: {
							username: {
								minlength: PearltreesSignFormErrors.usernameTooShort,
								maxlength: PearltreesSignFormErrors.usernameTooLong,
								required: PearltreesSignFormErrors.usernameTooShort
							},
							socialusername: {
								minlength: PearltreesSignFormErrors.usernameTooShort,
								maxlength: PearltreesSignFormErrors.usernameTooLong,
								required: PearltreesSignFormErrors.usernameTooShort
							},
							email: {
								required: PearltreesSignFormErrors.mailInvalid,
								maxlength: PearltreesSignFormErrors.mailInvalid,
								email: PearltreesSignFormErrors.mailInvalid
							},
							socialemail: {
								required: PearltreesSignFormErrors.mailInvalid,
								maxlength: PearltreesSignFormErrors.mailInvalid,
								email: PearltreesSignFormErrors.mailInvalid
							},
							password: {
								minlength: PearltreesSignFormErrors.passwordTooShort,
								required: PearltreesSignFormErrors.passwordTooShort
							},
							socialpassword: {
								minlength: PearltreesSignFormErrors.passwordTooShort,
								required: PearltreesSignFormErrors.passwordTooShort
							}

						},
						invalidHandler: function() {
						}
						,
						showErrors: function(errorMap, errorList) {
                            setTimeout(function() {
                                for (var i = 0; i<(fieldsToValidate.length);i++) {
                                    for (var p in errorMap) {
                                        $t("#" + p + "_error").html(errorMap[p]);
                                    }
                                }
                            }, 200);
                            if (!(typeof isSocialSignupModel === 'undefined')) {
                                if (isSocialSignupModel() & PearltreesHomeSign.validator.checkForm() & !PearltreesHomeSign.isUsernameTaken) {
        							changeSocialNextButtonState(true);
                                }
        						else {
        							changeSocialNextButtonState(false);
                                }
                            }
						},

						highlight: function(element) {
						},
						success: function(element) {
						}

					});
		},
		isFormSubmittable : function() {
			var invalid = this.validator.numberOfInvalids();
			return invalid == 0 && !PearltreesHomeSign.isUsernameTaken;
		},
		initUsernameSanitization : function(usernameId, usernameErrorId) {
			$t(usernameId).keyup( function(){
				var $tthis = $t(this);
				setTimeout(function() {
					PearltreesHomeSign.sanitizeUserName($tthis);
				}, 1);
			});
			$t(usernameId).blur(function() {
				PearltreesHomeSign.testUsernameTaken(usernameId, usernameErrorId);
			});
		},

		sanitizeUserName : function(elt) {
			var userName = elt.val();
			// Remove bad caractere :
			var pattern = /[0-9a-z_A-Z]/;
			var sanitized ="";
			for (var i = 0, len = userName.length; i < len; i++) {
				if(pattern.test(userName[i])){
					sanitized += userName[i];
				}
			}
			//sanitized = sanitized.toLowerCase();
			if (sanitized != userName) {
				// store current positions in variables
				var start = elt.selectionStart,
				end = elt.selectionEnd;

				elt.val(sanitized);
				//this.setSelectionRange(start, end);

			}
		},

		submitSocialSignUp: function(callbacks) {
				if ($t('#forms').valid()) {
					callbacks.onFormValid();
					$t(".form_error").html("");
					var name = encodeURIComponent($t('#input-username').val().toLowerCase());
					$t.post(PearltreesHomeSign.getUsernameTakenUrl(), "name=" + name)
					.done(function( data ) {
						if(data.isTaken) {
							PearltreesHomeSign.displayUsernameTaken('#username_error');
						}
						else {							
							var requestStringCA = [];
							var originKey = sessionStorage ? sessionStorage.getItem("arrival") : "";
							var bacASableStatus = PearltreesHomeSign.computeBacASableStatus();
							requestStringCA.push(
									"serviceType=",
									parseInt(getSignupType()),
									"&tid=",
									parseInt(getTid()),
									"&",
									$t('#forms').serialize(),
									"&locale=",
									encodeURIComponent(PearltreesHomeCommon.getClientLang()),
									"&newAvatarHash=",
									getNewAvatarHash(),
									"&originTarget=",
									encodeURIComponent(originKey),
									"&bacASableStatus=",
									bacASableStatus,
									"&abModel=",
									PearltreesAbTestParams.homeAndSignUpBanner,
									"&arrival=",
									sessionStorage.getItem("arrival")
							);
							var reqDataCA = requestStringCA.join("");
							$t.post(PearltreesHomeSign.getSignUpFromExternalServiceUrl(), reqDataCA)
							.done(function( data ) {
								if(data.isCreated) {
									PearltreesHomeSign.syncGACreatedEvent();
									PearltreesHomeSign.saveFirstSessionFlag();
									setTimeout(function() {
										callbacks.onAccountCreated();
									}, 100);
								}
								else {
									PearltreesHomeSign.displaySocialServerError();
									callbacks.onAccountCreationError();
								}
							})
							.fail(function() {
								PearltreesHomeSign.displaySocialServerError();
								callbacks.onAccountCreationError();
							});
						}
					})
					.fail(function() {
						PearltreesHomeSign.displaySocialServerError();
					});
				}
		},
		initSignUpSubmission : function() {
			$t('#signup_form').submit(function( event )
					{
				event.preventDefault();
				if ($t('#signup_form').valid()) {
					$t("#signup-button").hide();
					$t("#signup-loader-button").show();
					PearltreesHomeSign.animateLoader();
					$t(".form_error").html("");
					$.ajax({
                                		url: '/api/username_available.json',
                                		data: {user: $t('#username').val().toLowerCase()},
                                		success: function(data) {
							if(data == false) {
								PearltreesHomeSign.displayUsernameTaken('#username_error');
							}
							else {
								var requestString = [];
								var originKey = sessionStorage ? sessionStorage.getItem("arrival") : "";
								var bacASableStatus = PearltreesHomeSign.computeBacASableStatus();
								requestString.push(
									"op=",
                                                    			"reg",
									"&dest=",
									baseurl,
									"&user=",
									$t('#username').val().toLowerCase(),
									"&email=",
									$t('#email').val(),
									"&passwd=",
									$t('#password').val(),
									"&passwd2=",
                                                    			$t('#password').val(),
									"&api_type=",
									"json"
								);
								var reqData = requestString.join("");
								$.ajax({
                							url: '/api/register/'+$t('#username').val(),
                							type: 'POST',
                							dataType: 'json',
                							data: reqData,
                							xhrFields: {
                							withCredentials: true
                							},
                							success: function(data) {
                          							if(data.json.errors.length == 0) {
                                					  	  PearltreesHomeSign.raiseCommandEvent("login");
                                					  	  window.location = '/';
                          							}else {
                                					  	  $t("#signin-button").show();
                                					  	  PearltreesHomeSign.hideLoaderImagesLogin();
                                					    	  $t("#log_error").html(PearltreesSignFormErrors.signinIncorrect);
                          							}
                        						},
									error: function(){
										PearltreesHomeSign.displayServerError();
                							}					
								})
							}
						},
						error: function() {
							PearltreesHomeSign.displayServerError();
						}
				});
			}})
		},
		
		computeBacASableStatus: function() {
			var bacASableStatus = "unknown";
			if (sessionStorage) {
				if (typeof sessionStorage.getItem("seenBacASable") !== 'undefined' && sessionStorage.getItem("seenBacASable") !== null) {
					sessionStorage.removeItem("hasSeenBacASable");
					if (typeof sessionStorage.getItem("playBacASable") !== 'undefined' && sessionStorage.getItem("playBacASable") !== null) {
						sessionStorage.removeItem("playBacASable");
						bacASableStatus = "play";
					}
					else {
						bacASableStatus = "seen";
					}
				}
			}
			return bacASableStatus;
		},
		
		saveIdentity: function(callbacks) {
			if ($t('#forms').valid()) {
				callbacks.onFormValid();
				$t.ajax({
			        type: "POST",
			        url: PearltreesHomeCommon.getServicesUrl() + '/settingsapi/saveIdentity',
			        data: $t('#forms').serialize(),
			        timeout: 5000, // in milliseconds
			        success: function(data) {
						if(data && data['isSaved'] == true) {
							callbacks.onIdentitySaved(data);
						}
						else {
							callbacks.onSaveIdentityError();
						}
			        },
			        error: function(request, status, err) {
			            if(status == "timeout") {
			                window.alert('Timeout');
			            }
			            else {
			            	window.alert('Error');
			            }
			            callbacks.onSaveIdentityError();
			        }
			    });
			}
			else {
				callbacks.onSaveIdentityError();
			}
		},
		testUsernameTaken : function(usernameId, usernameErrorId) {
			if ($t(usernameId).val().toLowerCase().length && $t(usernameId).val().toLowerCase().length >=3 && $t(usernameId).val().toLowerCase().length <=40) {
                		$.ajax({
                   	 		url: '/api/username_available.json',
                    			data: {user: $t(usernameId).val().toLowerCase()},
					usernameErrorId: usernameErrorId,
                    			success: function(data) {
						setTimeout(PearltreesHomeSign.displayUsernameStatus, 200, data, this.usernameErrorId) 
					}
				})
			}
		},
		displayUsernameStatus: function(result, usernameErrorId) {
            	    if(result == false)
			PearltreesHomeSign.displayUsernameTaken(usernameErrorId);
   		 },

		displayServerError : function() {
			$t(".form_error").html("");
			$t("#signup-button").show();
			PearltreesHomeSign.hideLoaderImages();
			$t("#password_error").html(PearltreesSignFormErrors.serverError);
		},

		displaySocialServerError : function() {
			$t(".form_error").html("");
			$t("#NextButton0").show();
			$t("#signup-loader-button").hide();
			$t("#password_error").html(PearltreesSignFormErrors.serverError);
		},

		displayUsernameTaken : function(usernameErrorId) {
			$t("#signup-button").show();
			PearltreesHomeSign.hideLoaderImages();
			$t(usernameErrorId).html(PearltreesSignFormErrors.usernameTaken);
		},
		
		cancel: function(){
			$('#signin_button').show();
			$('#' + this.currentPage).hide();
		},
		submitLogInForm : function () {
			$t("#log_error").html(" ");
			$t("#signin-button").hide();
			$t("#signin-loader-button").show();
			PearltreesHomeSign.animateLoaderLogin();
			var requestString = [];
			requestString.push(
					"user=",
					$t('#log_username').val(),
					"&passwd=",
					$t('#log_password').val(),
					"&op=",
                    			"login",
					"&api_type=",
					"json"
			);
			var reqData = requestString.join("");
            		$.ajax({
                		url: '/api/login/'+$t('#log_username').val(),
                		type: 'POST',
                		dataType: 'json',
                		data: reqData,
                		xhrFields: {
                    		withCredentials: true
                		},
                		success: function(data) {
            				  if(data.json.errors.length == 0) {
            					PearltreesHomeSign.raiseCommandEvent("login");
            					window.location = '/'; 
            				  }else {
            					$t("#signin-button").show();
            					PearltreesHomeSign.hideLoaderImagesLogin();
            					$t("#log_error").html(PearltreesSignFormErrors.signinIncorrect);
            				  }
            				}
            		})
		},

		animateLoader : function () {
			PearltreesHomeSign.showLoaderButtonSignUp = true;
			setTimeout(function() { PearltreesHomeSign.showLoaderImages(1);}, 0);
			setTimeout(function() { PearltreesHomeSign.showLoaderImages(2);}, 80);
			setTimeout(function() { PearltreesHomeSign.showLoaderImages(3);}, 160);
			setTimeout(function() { PearltreesHomeSign.showLoaderImages(4); }, 240);
			setTimeout(function() { PearltreesHomeSign.showLoaderImages(5); }, 320);
			setTimeout(function() { PearltreesHomeSign.showLoaderImages(6); }, 400);
			setTimeout(function() { PearltreesHomeSign.showLoaderImages(7); }, 480);
			setTimeout(function() { PearltreesHomeSign.showLoaderImages(8); }, 560);
			setTimeout(function() { PearltreesHomeSign.showLoaderImages(9); }, 640);
			setTimeout(function() { PearltreesHomeSign.showLoaderImages(10); }, 720);
			setTimeout(function() { PearltreesHomeSign.showLoaderImages(11); }, 800);
			setTimeout(function() { PearltreesHomeSign.showLoaderImages(12); }, 880);
		},
		showLoaderImages : function (idx) {
			$t('.load').hide();
			$t('#l' + idx).show();
			if (idx == 12 && PearltreesHomeSign.showLoaderButtonSignUp) {
				setTimeout(function() { PearltreesHomeSign.animateLoader(); }, 80);
			}
		},

		hideLoaderImages : function () {
			PearltreesHomeSign.showLoaderButtonSignUp = false;
			$t("#signup-loader-button").hide();
		},

		animateLoaderLogin : function () {
			PearltreesHomeSign.showLoaderButtonLogin = true;
			setTimeout(function() { PearltreesHomeSign.showLoaderImagesLogin(1);}, 0);
			setTimeout(function() { PearltreesHomeSign.showLoaderImagesLogin(2);}, 80);
			setTimeout(function() { PearltreesHomeSign.showLoaderImagesLogin(3);}, 160);
			setTimeout(function() { PearltreesHomeSign.showLoaderImagesLogin(4); }, 240);
			setTimeout(function() { PearltreesHomeSign.showLoaderImagesLogin(5); }, 320);
			setTimeout(function() { PearltreesHomeSign.showLoaderImagesLogin(6); }, 400);
			setTimeout(function() { PearltreesHomeSign.showLoaderImagesLogin(7); }, 480);
			setTimeout(function() { PearltreesHomeSign.showLoaderImagesLogin(8); }, 560);
			setTimeout(function() { PearltreesHomeSign.showLoaderImagesLogin(9); }, 640);
			setTimeout(function() { PearltreesHomeSign.showLoaderImagesLogin(10); }, 720);
			setTimeout(function() { PearltreesHomeSign.showLoaderImagesLogin(11); }, 800);
			setTimeout(function() { PearltreesHomeSign.showLoaderImagesLogin(12); }, 880);
		},

		showLoaderImagesLogin : function (idx) {
			$t('.load').hide();
			$t('#sl' + idx).show();
			if (idx == 12 && PearltreesHomeSign.showLoaderButtonLogin) {
				setTimeout(function() { PearltreesHomeSign.animateLoaderLogin(); }, 80);
			}
		},

		hideLoaderImagesLogin : function () {
			PearltreesHomeSign.showLoaderButtonLogin = false;
			$t("#signin-loader-button").hide();
		},

		initPlaceholderFocusColor : function () {
			$t(".form_control").focus(function() {
				$t(this).addClass("form_control_focus");
			});
			$t(".form_control").blur(function() {
				$t(this).removeClass("form_control_focus");
			});
		},

		delayCarousel : function() {
			if (!PearltreesHomeSign.isAutoSlidingDisabled) {
				$t('.carousel').carousel('pause');
				if (PearltreesHomeSign.carouselTimeOut != null) {
					clearTimeout(PearltreesHomeSign.carouselTimeOut);
				}
				PearltreesHomeSign.carouselTimeOut = setTimeout(function() {
					$t('.carousel').carousel('cycle');
				}, PearltreesHomeSign.carouselDelay);
			}
		},
		
		redirect : function() {
			if (typeof(Storage)!=="undefined") {
				var redirect = sessionStorage.getItem("signin_page");
				if (redirect === "true") {
					PearltreesHomeSign.showPage('signin_page');
					this.hasArrivalPage = true;
					sessionStorage.removeItem("signin_page");
				}
			}
		},
		
		syncGACreatedEvent: function() {
			if (typeof(_gaq) !== "undefined") {
				_gaq.push(['_trackEvent', 'Home', 'Create Account', self.location.search]);
			}
		},
		
		saveFirstSessionFlag: function() {
			if (sessionStorage) {
               sessionStorage.setItem("isFirstUserSession", "true");
               if (document.createEvent) {
	               var event = document.createEvent('Event');
				   event.initEvent('isFirstUserSession', true, true);
			       document.dispatchEvent(event);
			   }
            }
		}
}

PearltreesHomeSign.redirect();
