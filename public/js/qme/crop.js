$(function () {
    document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
        const dropZoneElement = inputElement.closest(".drop-zone");

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

    /**
     * Updates the thumbnail on a drop zone element.
     *
     * @param {HTMLElement} dropZoneElement
     * @param {File} file
     */
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


            console.log(cropper);

            return false;

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


    document.querySelector('#btnCrop').addEventListener('click', function () {

        var siteUrl = document.location.origin;
        var img = cropper.getDataURL();
        img = dataURLtoFile(img, 'image.png');
        
        let url = "business-image";
        var formData = new FormData();
        formData.append('_token', $('meta[name="csrf-token"]').attr('content')); 
        formData.append('image_data', img);

        $.ajax({
            url: url,
            type: 'POST',
            contentType: 'multipart/form-data',
            cache: false,
            contentType: false,
            processData: false,
            data: formData,
            success: (response) => {     
                if(response.message == "Success"){
                    let imageUrl = storagePath + response.response.image_name;
                    $(".email-container .drop-zone__thumb").remove();

                    $('#preview-image-container').attr('src', imageUrl);
                    $("#master-id").val(response.response.document_id);
                }
            },
            error: (response) => {
                console.log(response);
            }
        });

        let thumbnailElement = document.querySelector(".drop-zone__thumb");

        thumbnailElement.style.setBackground = "url("+img+")";
        $('#business_logo').val(img);


       // $('.drop-zone .img_div').html('<img src="' + img + '"><input type="hidden" name="' + img +'" name="business_logo_image">');
        $('#cropModal').modal('hide');
        $('#upload').val('');

    })

    document.querySelector('#btnZoomIn').addEventListener('click', function () {
        cropper.zoomIn();
    })
    document.querySelector('#btnZoomOut').addEventListener('click', function () {
        cropper.zoomOut();
    })

});

function dataURLtoFile(dataURL, filename) {
    var arr = dataURL.split(',');
    var mime = arr[0].match(/:(.*?);/)[1];
    var bstr = atob(arr[1]);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
}


var cropbox = function(options){
    var el = document.querySelector(options.imageBox),
        obj =
        {
            state : { },
        ratio : 1,
        options : options,
        imageBox : el,
        thumbBox : el.querySelector(options.thumbBox),
        spinner : el.querySelector(options.spinner),
        image : new Image(),
        getDataURL: function ()
        {
        var width = this.thumbBox.clientWidth,
        height = this.thumbBox.clientHeight,
        canvas = document.createElement("canvas"),
        dim = el.style.backgroundPosition.split(' '),
        size = el.style.backgroundSize.split(' '),
        dx = parseInt(dim[0]) - el.clientWidth/2 + width/2,
        dy = parseInt(dim[1]) - el.clientHeight/2 + height/2,
        dw = parseInt(size[0]),
        dh = parseInt(size[1]),
        sh = parseInt(this.image.height),
        sw = parseInt(this.image.width);

        canvas.width = width;
        canvas.height = height;
        var context = canvas.getContext("2d");
        context.drawImage(this.image, 0, 0, sw, sh, dx, dy, dw, dh);
        var imageData = canvas.toDataURL('image/png');
        return imageData;
    },
    getBlob: function()
    {
    var imageData = this.getDataURL();
    var b64 = imageData.replace('data:image/png;base64,','');
    var binary = atob(b64);
    var array = [];
    for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return  new Blob([new Uint8Array(array)], {type: 'image/png'});
},
    zoomIn: function ()
    {
        this.ratio *= 1.1;
    setBackground();
},
    zoomOut: function ()
    {
        this.ratio *= 0.9;
    setBackground();
}
},
    attachEvent = function(node, event, cb)
    {
if (node.attachEvent)
    node.attachEvent('on'+event, cb);
    else if (node.addEventListener)
    node.addEventListener(event, cb);
},
    detachEvent = function(node, event, cb)
    {
if(node.detachEvent) {
        node.detachEvent('on' + event, cb);
}
    else if(node.removeEventListener) {
        node.removeEventListener(event, render);
}
},
    stopEvent = function (e) {
if(window.event) e.cancelBubble = true;
    else e.stopImmediatePropagation();
},
    setBackground = function()
    {
var w =  parseInt(obj.image.width)*obj.ratio;
    var h =  parseInt(obj.image.height)*obj.ratio;

    var pw = (el.clientWidth - w) / 2;
    var ph = (el.clientHeight - h) / 2;

    el.setAttribute('style',
    'background-image: url(' + obj.image.src + '); ' +
    'background-size: ' + w +'px ' + h + 'px; ' +
    'background-position: ' + pw + 'px ' + ph + 'px; ' +
    'background-repeat: no-repeat');
},
    imgMouseDown = function(e)
    {
        stopEvent(e);

    obj.state.dragable = true;
    obj.state.mouseX = e.clientX;
    obj.state.mouseY = e.clientY;
},
    imgMouseMove = function(e)
    {
        stopEvent(e);

    if (obj.state.dragable)
    {
    var x = e.clientX - obj.state.mouseX;
    var y = e.clientY - obj.state.mouseY;

    var bg = el.style.backgroundPosition.split(' ');

    var bgX = x + parseInt(bg[0]);
    var bgY = y + parseInt(bg[1]);

    el.style.backgroundPosition = bgX +'px ' + bgY + 'px';

    obj.state.mouseX = e.clientX;
    obj.state.mouseY = e.clientY;
}
},
    imgMouseUp = function(e)
    {
        stopEvent(e);
    obj.state.dragable = false;
},
    zoomImage = function(e)
    {
var evt=window.event || e;
    var delta=evt.detail? evt.detail*(-120) : evt.wheelDelta;
delta > -120 ? obj.ratio*=1.1 : obj.ratio*=0.9;
    setBackground();
}

    obj.spinner.style.display = 'block';
    obj.image.onload = function() {
        obj.spinner.style.display = 'none';
    setBackground();

    attachEvent(el, 'mousedown', imgMouseDown);
    attachEvent(el, 'mousemove', imgMouseMove);
    attachEvent(document.body, 'mouseup', imgMouseUp);
    var mousewheel = (/Firefox/i.test(navigator.userAgent))? 'DOMMouseScroll' : 'mousewheel';
    attachEvent(el, mousewheel, zoomImage);
};
    obj.image.src = options.imgSrc;
    attachEvent(el, 'DOMNodeRemoved', function(){detachEvent(document.body, 'DOMNodeRemoved', imgMouseUp)});

    return obj;
};
