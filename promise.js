define([],function{
	
	function Promise() {
		this.fulfills = [];
		this.rejects = [];
		this.value = undefined; // tristate, undefined, thenable, promise
		this.reason = undefined; // value of why promise was rejected
		this.i = 0; //current resolve iteration.
	}

	Promise.prototype.then = function(onFulfilled, onRejected) {

		if (typeof onFulfilled === 'function') {
			if (this.value !== undefined) {
				this.value = onFulfilled(this.value);
			} else {
				this.fulfills.push(onFulfilled);
			}
			
		} else if(onFulfilled !== undefined) {
			throw new Error('no success function provided');
		}

		if(typeof onRejected === 'function') {
			if (this.reason !== undefined) {
				this.reason = onRejected(this.reason);
			} else {
				this.rejects.push(onRejected);
			}
		} else if(onRejected !== undefined) {
			throw new Error('no fail function provided');
		}

		return this;
	}

	Promise.prototype.resolve = function(val, i) {
		this.value = val;
		this.envokeAll('fulfills', this.value, i)
	}

	Promise.prototype.reject = function(err, i){
		this.reason = err;
		this.envokeAll('rejects', this.reason, i)
	};

	Promise.prototype.envokeAll = function(resultType, val, i) {
		var response = this[resultType]
		if(i === null){
			for(var i = 0; i < response.length; i++){
				this.envoke(resultType, val, i);
			}
		} else {
			this.envoke(resultType, val, i);
		}
	}

	Promise.prototype.envoke = function(resultType, val, i){
		var response = this[resultType]
		if(resultType ==='fulfills'){
			this.value = response[i](val);
		} else {
			this.reason =  response[i](val);
		}
	}

	Promise.prototype.resolveRecursive = function(val, f) {
		f(val[this.i], function (res, response) {
			var resolveIndex = val.length <= 1 ? null : this.i;
			if(response === 'success'){
				this.resolve(res, resolveIndex);
			} else {
				this.reject(res, resolveIndex);
			}
			
			this.i++;
			if(this.i >= val.length) { return }
			this.resolveRecursive(val, f);
		}.bind(this));
	};

	return Promise;

});