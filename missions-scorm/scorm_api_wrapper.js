/* pipwerks SCORM 1.2 API Wrapper - https://github.com/pipwerks/scorm-api-wrapper */
var pipwerks = {
	SCORM: {
		version: "1.2",
		handleCompletionStatus: true,
		API: {
			handle: null,
			isFound: false,
			get: function () {
				if (this.handle === null) {
					this.handle = this.find(window);
				}
				return this.handle;
			},
			find: function (win) {
				var API = null;
				while (win != null) {
					try {
						if (win.API != null) {
							API = win.API;
							break;
						}
					} catch (e) {}
					if (win.parent == null || win.parent == win) {
						break;
					}
					win = win.parent;
				}
				if (API == null && window.opener != null) {
					try {
						if (window.opener.API != null) {
							API = window.opener.API;
						}
					} catch (e) {}
				}
				return API;
			}
		},
		connection: {
			isActive: false
		},
		data: {
			completionStatus: "",
			exitStatus: ""
		},
		debug: {
			isActive: false
		},
		init: function () {
			var API = this.API.get();
			if (API) {
				this.connection.isActive = API.LMSInitialize("") === "true";
				if (this.connection.isActive) {
					if (this.handleCompletionStatus) {
						var lessonStatus = this.get("cmi.core.lesson_status");
						if (lessonStatus === "not attempted" || lessonStatus === "") {
							this.set("cmi.core.lesson_status", "incomplete");
						}
					}
				}
			}
			return this.connection.isActive;
		},
		get: function (parameter) {
			var value = "";
			if (this.connection.isActive) {
				var API = this.API.get();
				if (API) {
					value = API.LMSGetValue(parameter);
					if (this.debug.isActive) {
						console.log("SCORM get:", parameter, "=", value);
					}
				}
			}
			return value;
		},
		set: function (parameter, value) {
			var success = false;
			if (this.connection.isActive) {
				var API = this.API.get();
				if (API) {
					success = API.LMSSetValue(parameter, value) === "true";
					if (this.debug.isActive) {
						console.log("SCORM set:", parameter, "=", value);
					}
				}
			}
			return success;
		},
		save: function () {
			var success = false;
			if (this.connection.isActive) {
				var API = this.API.get();
				if (API) {
					success = API.LMSCommit("") === "true";
					if (this.debug.isActive) {
						console.log("SCORM commit");
					}
				}
			}
			return success;
		},
		quit: function () {
			var success = false;
			if (this.connection.isActive) {
				var API = this.API.get();
				if (API) {
					success = API.LMSFinish("") === "true";
					if (this.debug.isActive) {
						console.log("SCORM finish");
					}
				}
			}
			this.connection.isActive = false;
			return success;
		}
	}
};
