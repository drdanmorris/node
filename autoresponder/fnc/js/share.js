/*jslint browser:true */
/*global jQuery: false */
(function ($, window, ASB) {
    "use strict";
    var shareUrl = "", accountNumber = "";
    window.ASB = ASB || {};
    ASB.CoP = {};
    ASB.CoP.InitializeCopShare = function (options) {
        shareUrl = options.shareUrl;
        accountNumber = options.accountNumber;
    };

    $(function () {
        var $shareBtn = $("#shareAccountDetails");

        function tweakShareBtn(classesToAdd, classesToRemove, text) {
            if (classesToAdd) {
                $shareBtn.addClass(classesToAdd);
            }

            if (classesToRemove) {
                $shareBtn.removeClass(classesToRemove);
            }

            if (text) {
                $shareBtn.text(text);
            }
        }

        function getOwnerNamesFrom(result) {
            if (result && result.Names) {
                return accountNumber + "\n" + result.Names;
            }
            return accountNumber;
        }

        function onError() {
            setTimeout(function () {
                tweakShareBtn('error', 'working', 'Unable to retrieve account details');
            }, 1000);
            return -1;
        }

        function copyToClipboardFallback(text) {
            var dummy = document.createElement('textarea');
            dummy.style.position = "fixed";
            document.body.appendChild(dummy);
            dummy.value = text;
            dummy.select();
            document.execCommand("copy");
            document.body.removeChild(dummy);
        }

        function copyToClipboard(text) {
            try {
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(text)["catch"](function () {
                        copyToClipboardFallback(text);
                    });
                } else {
                    copyToClipboardFallback(text);
                }
            } catch (e) {
                copyToClipboardFallback(text);
            }
        }

        function onComplete(result) {
            try {
                var names = getOwnerNamesFrom(result);
                setTimeout(function () { copyToClipboard(names); }, 0);
            } catch (ex) {
                return onError();
            }

            setTimeout(function () {
                tweakShareBtn('done', 'working', 'Account details copied to clipboard LOCAL');
                setTimeout(function () {
                    tweakShareBtn('', 'done', 'Copy');
                }, 2000);

            }, 1000);
        }

        function getAccountDetailsFor() {
            $.ajax({
                url: shareUrl,
                type: "POST",
                dataType: "json",
                data: { accountNumber: accountNumber },
                success: function (result) {
                    onComplete(result);
                },
                error: function () {
                    onComplete();
                }
            });
        }

        $shareBtn.click(function () {
            if ($shareBtn.hasClass('working')) {
                return;
            }

            if ($shareBtn.hasClass('done') || $shareBtn.hasClass('error')) {
                tweakShareBtn('', 'done error', 'Copy');
            } else {
                tweakShareBtn('working', '', 'Retrieving');
                getAccountDetailsFor();
            }
        });

    });

}(jQuery, window, window.ASB || {}));