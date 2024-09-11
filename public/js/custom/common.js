var table = '';

$(function () {
    $("#email-table").DataTable();

    setTimeout(function () {
        $(".alert.alert-success").hide('slow');
        $(".alert.alert-danger").hide('slow');
    }, 3000);

    $('input').attr('autocomplete', 'off');
    $('input[type=password]').attr('autocomplete', 'new-password');

    $("select.select2").selectpicker();
    $("select.select2-multiple").selectpicker();
    $("select.selectpicker").selectpicker();
    if ($('#orderItemTable select.defect-select').length > 0) {
        $('#orderItemTable select.defect-select').select2();
    }

    $.fn.dataTable.ext.errMode = "throw";

    $.fn.dataTable.tables({ visible: true, api: true }).on('xhr', function (e, settings, json, xhr) {
        if (xhr === undefined || xhr.responseJSON === undefined){
            errorToastr("No data received.");
        } else if(xhr.responseJSON.draw === undefined) {
            errorToastr(xhr.responseJSON.message);
        }
    });

    jQuery.validator.addMethod("username", function (value, element) {
        return this.optional(element) || /^[a-zA-Z0-9_\-\.]+$/i.test(value);
    }, "Only A-Z a-Z 0-9 _ - . accept");

    jQuery.validator.addMethod("lettersonly", function (value, element) {
        return this.optional(element) || /^[A-Za-z ]+$/i.test(value);
    }, "Only A-Z a-Z accept");

    jQuery.validator.addMethod("numbersonly", function (value, element) {
        return this.optional(element) || /^[0-9]+$/i.test(value);
    }, "Only 0-9 accept");

    jQuery.validator.addMethod("alphanumneric", function (value, element) {
        return this.optional(element) || /^[A-Za-z0-9 ]+$/i.test(value);
    }, "Only A-Z a-Z 0-9 accept");

    var emailRegrex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/i;

    jQuery.validator.addMethod("emailform", function (value, element) {
        return this.optional(element) || emailRegrex.test(value);
    }, "Email format not valid");

    var pwdRegrex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    jQuery.validator.addMethod("strongpassword", function (value, element) {
        return this.optional(element) || pwdRegrex.test(value);
    }, 'Password length must be min. 8 characters having one uppercase, one lowercase, one numeric');

    if ($('li.expand').hasClass('active')) {
        $(this).find('li.expand.active').parent().parent().addClass('active');
    }

    $('form').not('.modal form, .operatorScreen form, #create-worflow').on("submit", function () {
        $('.loader').show();
    });

    setInterval(function () {
        if ($("span").hasClass('invalid-feedback')) {
            $('.loader').hide();
        }
    }, 3000);
})

var xhr = "";
function callAjax(url, jsonData, type = "POST") {
    var _csrf = $('meta[name=csrf-token]').attr('content');
    jsonData['_token'] = _csrf;
    var result = '';

    // if (xhr != "") {
    //     xhr.abort();
    // }

    xhr = $.ajax({
        url: BASE_URL + url,
        type: type,
        async: false,
        data: jsonData,
        dataType: 'json',
        tryCount: 0,
        retryLimit: 10,
        beforeSend: function () {
            $('.loader').show();
        },
        success: function (response) {
            result = response;
        },
        error: function (_xhr, _textStatus, _errorThrown) {
            this.tryCount++;

            result = _xhr.responseJSON.errors;
            // if (this.tryCount <= this.retryLimit) {
            //     console.log('try again'); //try again
            //     setTimeout(function () {
            //         $.ajax(this);
            //         return;
            //     }, 2000);
            // } else {
            //     console.log('CONNECTION PROBLEM');
            // }
            // return;
        },
        complete: function () {
            $('.loader').hide();
        }
    });
    return result;
}

function callAjaxFunction(hrefurl, dataJson, funcToExecute, type = "POST", element={}) {
    var _csrf = $('meta[name=csrf-token]').attr('content');
    dataJson['_token'] = _csrf;


    
    var result = '';
    xhr = $.ajax({
        url: BASE_URL + hrefurl.replace(BASE_URL, ""),
        type: type,
        headers: {
            'X-CSRF-Token': $('[name="_csrfToken"]').val()
        },
        //async: false,
        data: dataJson,
        dataType: 'json',
        tryCount: 0,
        retryLimit: 10,
        beforeSend: function () {
            $('.loader').show();
        },
        success: function (response) {
            result = response;
            funcToExecute(result, element);
        },
        error: function (_xhr, _textStatus, _errorThrown) {
            //this.tryCount++;
            // if (this.tryCount <= this.retryLimit) {
            //     console.log('try again'); //try again
            //     setTimeout(function () {
            //         $.ajax(this);
            //         return;
            //     }, 2000);
            // } else {
            //     console.log('CONNECTION PROBLEM');
            // }
            //return;
            console.log(_xhr.status);
            console.log(_errorThrown);
            
            //result = _xhr.responseJSON.errors;
            
        },
        complete: function () {
            $('.loader').hide();
        }
    });
    return result;
}

$(document).on('click', '.changePassword', function () {
    $('#password-change-modal').modal('show');
});

$(document).on('click', '.saveChangePassword', function () {

    var old = $('#password-change-modal #old').val();
    var newp = $('#password-change-modal #new').val();
    var confirm = $('#password-change-modal #confirm').val();

    var jsonData = {
        'old': old,
        'new': newp,
        'confirm': confirm,
    }

    var saveChangePasswordExec = function (response) {
        if (response.code == 200) {
            $.alert({
                title: 'Success',
                type: 'green',
                content: response.response,
                animation: 'scale',
                closeAnimation: 'right',
                autoClose: 'ok|3000',
                escapeKey: 'ok',
                buttons: {
                    ok: {
                        btnClass: 'hidden',
                        text: ' ',
                        action: function () {
                            $('#password-change-modal').modal('hide');
                        }
                    }
                },
                backgroundDismiss: function () {
                    return false;
                },
            });
        } else if (response.code == 201) {
            $.alert({
                title: 'Error',
                type: 'red',
                content: response.response,
            });
        } else {
            var errors = '<ul>';
            $.each(response, function (index, value) {
                var errArr = [];
                $.each(value, function (subindex, subvalue) {
                    errArr.push(subvalue);
                });
                errors += '<li>' + errArr.join(', ') + '</li>';
            });
            errors += '</ul>';

            $.alert({
                title: 'Error',
                type: 'red',
                content: errors,
            });
        }
    }

    var url = "/profile/change-password";

    callAjaxFunction(url, jsonData, saveChangePasswordExec);
});

$(document).on('click', '.common_delete', function (event) {
    event.preventDefault();
    var id = $(this).data('id');

    $.confirm({
        title: 'Delete',
        content: 'Are you sure, you want to delete?',
        autoClose: 'cancelAction|10000',
        escapeKey: 'cancelAction',
        buttons: {
            confirm: {
                btnClass: 'btn-red',
                text: 'Delete',
                action: function () {
                    $('#' + id).submit();
                }
            },
            cancelAction: {
                text: 'Cancel'
            }
        }
    });
});

function isNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
}

function ucwords(str) {
    str = str.toLowerCase().replace(/\b[a-z]/g, function (letter) {
        return letter.toUpperCase();
    });

    return str;
}

function strtolower(str) {

    str = str.toLowerCase();

    return str;
}

function printFile(response) {
    printJS({
        printable: BASE_URL + response,
        type: "pdf",
        imageStyle: "width:50%;margin-bottom:20px;",
        showModal: true,
    });
}

$(".under_maintenance").click(function (e) {
    e.preventDefault();
    var token = $("#tokenvalue").val();


    $.confirm({
        title: 'Confirm!',
        content: 'Are you sure you want to put website on maintenance?',
        buttons: {
            confirm: function () {
                $.alert({
                    title: 'Alert!',
                    content: 'Your Token No. is \n' + token,
                    buttons: {
                        Ok: function () {
                            window.location.href = "/down/" + token;
                        },
                        cancel: function () {

                        },
                    }
                });

            },
            cancel: function () {

            },

        }
    });
});

$.fn.enterKey = function (fnc) {
    return this.each(function () {
        $(this).keypress(function (ev) {
            var keycode = (ev.keyCode ? ev.keyCode : ev.which);
            if (keycode == '13') {
                fnc.call(this, ev);
            }
        })
    })
}

var dateFormat = function (date) {
    var date = new Date(date);
    return ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear();
}

var dateTimeFormat = function (date) {
    var date = new Date(date);
    return ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear() +  ' ' + date.getHours() + ":"
        + date.getMinutes() + ":"
        + date.getSeconds();
}

$(document).on("click", 'img.viewImage', function () {
    var imageSrc = $(this).attr('src');

    window.open(imageSrc, '_blank').focus();
});

$(function () {

    document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
        const dropZoneElement = inputElement.closest(".drop-zone");

        dropZoneElement.addEventListener("click", (e) => {
            inputElement.click();
        });

        inputElement.addEventListener("change", (e) => {
            if (inputElement.files.length) {
                updateThumbnail(dropZoneElement, inputElement.files[0]);
            }
        });

        dropZoneElement.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropZoneElement.classList.add("drop-zone--over");
        });

        ["dragleave", "dragend"].forEach((type) => {
            dropZoneElement.addEventListener(type, (e) => {
                dropZoneElement.classList.remove("drop-zone--over");
            });
        });

        dropZoneElement.addEventListener("drop", (e) => {
            e.preventDefault();
            
            if (e.dataTransfer.files.length) {
                inputElement.files = e.dataTransfer.files;
                updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
            }

            dropZoneElement.classList.remove("drop-zone--over");
        });
    });

    function updateThumbnail(dropZoneElement, file) {
        var fileName = file.name;
        var ext = fileName.split('.').pop().toLowerCase();
        if ($.inArray(ext, ['gif', 'png', 'jpg', 'jpeg']) == -1) {
            alert('Invalid File! ' + fileName);
            return false
        }

        let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

        // First time - remove the prompt
        if (dropZoneElement.querySelector(".drop-zone__prompt")) {
            dropZoneElement.querySelector(".drop-zone__prompt").remove();
        }

        // First time - there is no thumbnail element, so lets create it
        if (!thumbnailElement) {
            thumbnailElement = document.createElement("div");
            thumbnailElement.classList.add("drop-zone__thumb");
            dropZoneElement.appendChild(thumbnailElement);
        }

        thumbnailElement.dataset.label = fileName;
     
        var reader = new FileReader();

        reader.onload = function (e) {
            options.imgSrc = e.target.result;
            cropper = new cropbox(options);
        }
        reader.readAsDataURL(file);

        $('#cropModal').modal('show');
    }

    //Crop Image Section
    var options =
    {
        imageBox: '.imageBox',
        thumbBox: '.thumbBox',
        spinner: '.spinner',
        imgSrc: 'avatar.png'
    }
    var cropper;



    $(document).on('click', '#btnCrop', function () {
        
        var img = cropper.getDataURL()

        let thumbnailElement = document.querySelector(".drop-zone__thumb");

        thumbnailElement.style.backgroundImage = "url(" + img + ")";
        
        $('#business_logo').val(img);

        // $('.drop-zone .img_div').html('<img src="' + img + '"><input type="hidden" name="' + img +'" name="business_logo_image">');
        $('#cropModal').modal('hide');
    })


    $(document).on('click', '#btnZoomIn', function () {
        cropper.zoomIn();
    })

    $(document).on('click', '#btnZoomOut', function () {
        cropper.zoomOut();
    })
});

var cropbox = function (options) {
    var el = document.querySelector(options.imageBox),
        obj = {
            state: {},
            ratio: 1,
            options: options,
            imageBox: el,
            thumbBox: el.querySelector(options.thumbBox),
            spinner: el.querySelector(options.spinner),
            image: new Image(),
            getDataURL: function () {
                var width = this.thumbBox.clientWidth,
                    height = this.thumbBox.clientHeight,
                    canvas = document.createElement("canvas"),
                    dim = el.style.backgroundPosition.split(" "),
                    size = el.style.backgroundSize.split(" "),
                    dx = parseInt(dim[0]) - el.clientWidth / 2 + width / 2,
                    dy = parseInt(dim[1]) - el.clientHeight / 2 + height / 2,
                    dw = parseInt(size[0]),
                    dh = parseInt(size[1]),
                    sh = parseInt(this.image.height),
                    sw = parseInt(this.image.width);

                canvas.width = width;
                canvas.height = height;
                var context = canvas.getContext("2d");
                context.drawImage(this.image, 0, 0, sw, sh, dx, dy, dw, dh);
                var imageData = canvas.toDataURL("image/png");
                return imageData;
            },
            getBlob: function () {
                var imageData = this.getDataURL();
                var b64 = imageData.replace("data:image/png;base64,", "");
                var binary = atob(b64);
                var array = [];
                for (var i = 0; i < binary.length; i++) {
                    array.push(binary.charCodeAt(i));
                }
                return new Blob([new Uint8Array(array)], { type: "image/png" });
            },
            zoomIn: function () {
                this.ratio *= 1.1;
                setBackground();
            },
            zoomOut: function () {
                this.ratio *= 0.9;
                setBackground();
            },
        },
        attachEvent = function (node, event, cb) {
            if (node.attachEvent) node.attachEvent("on" + event, cb);
            else if (node.addEventListener) node.addEventListener(event, cb);
        },
        detachEvent = function (node, event, cb) {
            if (node.detachEvent) {
                node.detachEvent("on" + event, cb);
            } else if (node.removeEventListener) {
                node.removeEventListener(event, render);
            }
        },
        stopEvent = function (e) {
            if (window.event) e.cancelBubble = true;
            else e.stopImmediatePropagation();
        },
        setBackground = function () {
            var w = parseInt(obj.image.width) * obj.ratio;
            var h = parseInt(obj.image.height) * obj.ratio;

            var pw = (el.clientWidth - w) / 2;
            var ph = (el.clientHeight - h) / 2;

            el.setAttribute(
                "style",
                "background-image: url(" +
                obj.image.src +
                "); " +
                "background-size: " +
                w +
                "px " +
                h +
                "px; " +
                "background-position: " +
                pw +
                "px " +
                ph +
                "px; " +
                "background-repeat: no-repeat"
            );
        },
        imgMouseDown = function (e) {
            stopEvent(e);

            obj.state.dragable = true;
            obj.state.mouseX = e.clientX;
            obj.state.mouseY = e.clientY;
        },
        imgMouseMove = function (e) {
            stopEvent(e);

            if (obj.state.dragable) {
                var x = e.clientX - obj.state.mouseX;
                var y = e.clientY - obj.state.mouseY;

                var bg = el.style.backgroundPosition.split(" ");

                var bgX = x + parseInt(bg[0]);
                var bgY = y + parseInt(bg[1]);

                el.style.backgroundPosition = bgX + "px " + bgY + "px";

                obj.state.mouseX = e.clientX;
                obj.state.mouseY = e.clientY;
            }
        },
        imgMouseUp = function (e) {
            stopEvent(e);
            obj.state.dragable = false;
        },
        zoomImage = function (e) {
            var evt = window.event || e;
            var delta = evt.detail ? evt.detail * -120 : evt.wheelDelta;
            delta > -120 ? (obj.ratio *= 1.1) : (obj.ratio *= 0.9);
            setBackground();
        };

    obj.spinner.style.display = "block";
    obj.image.onload = function () {
        obj.spinner.style.display = "none";
        setBackground();

        attachEvent(el, "mousedown", imgMouseDown);
        attachEvent(el, "mousemove", imgMouseMove);
        attachEvent(document.body, "mouseup", imgMouseUp);
        var mousewheel = /Firefox/i.test(navigator.userAgent)
            ? "DOMMouseScroll"
            : "mousewheel";
        attachEvent(el, mousewheel, zoomImage);
    };
    obj.image.src = options.imgSrc;
    attachEvent(el, "DOMNodeRemoved", function () {
        detachEvent(document.body, "DOMNodeRemoved", imgMouseUp);
    });

    return obj;
};

function errorToastr(message, delay = 5000) {
    toastr.error(message, 'Error', { timeOut: delay });
}

function successToastr(message, delay = 5000) {
    toastr.success(message, 'Success', { timeOut: delay });
}