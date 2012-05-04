/**
* Copyright 2011 Microsoft Corporation
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

(function(global, undefined) {
    var root = global.Rx
    ,   observable = root.Observable
    ,   observableCreateWithDisposable = observable.createWithDisposable
    ,   ext = Ext;

    var fromExtJSEvent = function(extJSObject, eventName, scope, options) {
        return observableCreateWithDisposable(function(observer) {
            var em = ext.EventManager
            ,   handler = function(eventObject) {
                observer.onNext(eventObject);
            };
            em.on(extJSObject, eventName, handler, scope, options);
            return function() {
                em.un(extJSObject, eventName, handler, scope);
            };
        });
    };

    ext.Element.prototype.toObservable = function(eventName, scope, options) {
        return fromExtJSEvent(this, eventName, scope, options);
    };

    ext.util.Observable.prototype.toObservable = function(eventName, scope, options) {
        var parent = this;
        return observableCreateWithDisposable(function(observer) {
            var handler = function(eventObject) {                
                observer.onNext(eventObject);
            };
            parent.on(eventName, handler, scope, options);
            return function() {
                parent.un(eventName, handler, scope);
            };
        });  
    };

    ext.Ajax.observableRequest = function(options) {
        var k, newOptions = {};
        for (var k in options) {
            newOptions[k] = options[k];
        }
        var subject = new root.AsyncSubject();
        newOptions.success = function(response, opts) {
            subject.onNext({ response: response, options: opts });
            subject.onCompleted();
        };
        newOptions.failure = function(response, opts) {
            subject.onError({ response: response, options: opts });
        };
        ext.Ajax.request(newOptions);
        return subject;
    };

     ext.util.JSONP.observableRequest = function (options) {
        var k, newOptions = {};
        for (var k in options) {
            newOptions[k] = options[k];
        }
        var subject = new root.AsyncSubject();
        newOptions.success = function(response, opts) {
            subject.onNext({ response: response, options: opts });
            subject.onCompleted();
        };
        newOptions.failure = function(response, opts) {
            subject.onError({ response: response, options: opts });
        };
        ext.util.JSONP.request(newOptions);
        return subject;
     };
})(this);
