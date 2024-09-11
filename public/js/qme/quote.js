//const { forEach } = require("lodash");
var quoteTable = "";
var Total = 0;
var InstallAmount = 0;
let autocomplete;
let address1Field;
let address2Field;
let postalField;

$(function () {
    var authId = $("meta[name=auth]").attr("content");
    var siteUrl = document.location.origin;

    if ($('#quote_form').is(":visible")) {

        document.getElementById('quote_form').addEventListener('change', function () {
            formChanged = true;
        });

        // Attach event listener to form submission
        document.getElementById('quote_form').addEventListener('submit', function () {
            formChanged = false;
        });
    }

    if ($('#quote-table').is(":visible")) {
        if ($.fn.DataTable.isDataTable("#quote-table")) {
            $("#quote-table").DataTable().destroy();
        }        
        vendorTable = $("#quote-table").DataTable({
            responsive: true,
            dom: "lfgitp",
            aaSorting: [],
            responsive: true,
            processing: true,
            serverSide: true,
            ajax: {
                //url: siteUrl + "/vendors/vendor-dashboard/" + clientId,
                // url: APP_URL + "api/apibcquotes/get-quote/" + bcCustomerId,
                url: APP_URL + "quotes/bcquote/get-quote/" + bcCustomerId,
                data: { authId: authId },
            },

            columns: [
                { data: "title" },
                { data: "description" },
                // { data: "created_at" },
                { data: "notes" },
                { data: "status" },
                { data: "action" },
            ],
            columnDefs: [{ orderable: false, targets: [2,4] }],
            language: {
                infoFiltered: "",
            },
        });

        $('#datetimepicker1').datetimepicker();
    }

    $('#quote_form').on('submit', function (e) {
        e.preventDefault();  //prevent form from submitting

        if ($('#quote_form .invalid-feedback').not('.is-valid').is(':visible')){
            return false;
        }

        window.removeEventListener('beforeunload', function (event) {
            event.returnValue = 'Are you sure you want to leave?';
        });

        let selectedProduct = {};
        $.each($('select.product'), function (index, value) {
            let productId = $(value).val();
            selectedProduct[productId] = productId;
        });

        let selectionProduct = $.map(productSelection, function (element, index) { if (element !== undefined) { return index; } });
        let currentProductId = $.map(selectedProduct, function (element, index) { if (element !== undefined && element !== "") { return index; } });

        if (currentProductId.length == 0) {
            productSelection = {};
        }

        $.each(selectionProduct, function (index, selected_value) {
            if (currentProductId.indexOf(selected_value) == -1) {
                delete productSelection[selected_value];
            }
        });

        let title = "Quote Name";
        if ($('#quote_form #id').length > 0) {
            title += " (Leave blank if you want to continue with same.)";
        }

        reTotalAllProduct();

        let data = $("#quote_form").serialize();
        let jsonData = {
            'form_data': data,
            'total': Total,
            'tax': InstallAmount,
            'product_data': arrayToJson(productSelection)
        };

        let url = $("#quote_form").attr('action');
        let method = $("#quote_form").attr('method');

        callAjaxFunction(url, jsonData, formSubmitHandler, method);
    });

    if (window.localStorage.getItem('clickDownloadPdf') == 'true' && window.location.href.indexOf("/edit") > -1) {
        ;
        location.href = $(".quote-download-pdf-btn").attr('href');
    }
    setTimeout(
        function() {
            window.localStorage.removeItem('clickDownloadPdf');
        }, 1000);
});

const menu = document.getElementById('menu');
const backdrop = document.getElementById('backdrop');

//Create fixed sized arrays
//var dbProductInfo = Array.from({ length: 2000 }, (_, index) => []);
var dbProductInfo = {};
var productSelection = {};

var SelectedProductId;
if (backdrop != null) {
    backdrop.addEventListener('click', function () {
        document.body.classList.remove('menu-open');
    });
}

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',

    //These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

/**
 * Get all product using category id
 */
$(document).on('change', 'select.category', function (event) {

    let element = $(this);
    let categoryId = element.val();
    var url = "/quotes/bcquote/get-products";
    var jsonData = {
        'category_id': categoryId
    };

    callAjaxFunction(url, jsonData, fetchProduct, 'GET', $(this));
});

/**
 * create quote notes
 */
$("#submit_note").click(function () {
    // var noteSent = '/quotes/bcquote/get-quote-notes';    
    var sentNoteValue = $("#sent_note").val();    
    var quoteId = $(this).attr('quote_id');    

    if (sentNoteValue !== null && sentNoteValue !== '') {
        var url = "/quotes/bcquote/get-quote-notes/" + quoteId;
        var jsonData = {
            "note_sent": sentNoteValue,
        };

        var fetchQuotesResult = function (result) {
            if (result.code == 200) {
                $('.quoteNotes[data-quoteid=' + quoteId + ']').trigger('click');
                successToastr('Note add successfully');
                $('#sent_note').val("");
            } else {
                errorToastr('Unable to add note.');
            }
        };

        callAjaxFunction(url, jsonData, fetchQuotesResult, 'POST');
    } else {
        $("#close_date_sent_slide").click();
    }
});

/**
 * Get Product detail along with all variants and modifiers
 */
var selectedProduct = [];
$(document).on('change', 'select.product', function (event) {

    let element = $(this);
    let productId = element.val();
    let toggleButton = element.closest('div.productDiv').next('div.descriptionDiv');
    element.closest('tr').attr('id', "");
    element.closest('tr').find('img').attr('src', "");
    toggleButton.toggleClass('d-none');
    toggleButton.find('h3').html("");
    toggleButton.find('.menuToggle').removeAttr('data-product_id');
    toggleButton.find('li').not('li:first-child').remove();

    if (selectedProduct.indexOf(productId) >= 0) {
        errorToastr('Product already added.');
        element.prop("selectedIndex", 0);
        element.selectpicker('refresh');
        element.trigger('change');
        resetTr(element);
        return false;
    }

    $.each($('select.product'), function (index, value) {
        selectedProduct[index] = $(value).val();
    });

    if (productId == "") {        
        return false;
    }

    var url = "/quotes/bcquote/get-product";
    var jsonData = {
        'product_id': productId
    };

    callAjaxFunction(url, jsonData, fetchProductDetail, 'GET', $(this));
});

var resetTr = function(element){
    let productCustomizeTableInfoData = element.closest('tr');
    productCustomizeTableInfoData.find('.qty').val(1);
    productCustomizeTableInfoData.find('.baseprice').html(formatter.format(0));
    productCustomizeTableInfoData.find('.totalprice').html(formatter.format(0));

    updateDeleteProductSelection();
}

/**
 * Open right-menu for customize product
 */
$(document).on('click', '.menuToggle', function () {

    $('body').toggleClass('menu-open');

    if ($('body').hasClass('menu-open')) {
        let productId = $(this).data('product_id');
        menuToggle(productId);
        SelectedProductId = productId;
        updateProductSelection(SelectedProductId);

        updateCustomizeHeaders();
    }
});

/**
 * clone product table tr to add more product
 */
$(document).on('click', '.addmoreproduct', function () {
    let cloneTr = $('.productSelectTable tbody tr:first-child').clone();

    cloneTr.find('input.addProfit').val("");
    cloneTr.find('input.installValue').val("");
    cloneTr.find('input.taxValue').val(cloneTr.find('input.taxValue').data('value'));
    cloneTr.find('.addCost').html("");

    cloneTr.find('input.qty').val("");
    cloneTr.find('img').attr("src", "");
    cloneTr.find('.categoryDiv select').prop('selectedIndex', 0);
    cloneTr.find('.productDiv').addClass('d-none');
    cloneTr.find('.productDiv select').html("");
    cloneTr.find('.descriptionDiv').addClass('d-none');
    cloneTr.find('.descriptionDiv ul li').not('li:first-child').remove();
    cloneTr.find('.productDiv h3').html("");
    cloneTr.find('.productDiv .menuToggle').removeAttr("data-product_id");
    cloneTr.find('.baseprice').html("$0");
    cloneTr.find('.totalprice').html("$0");

    cloneTr.find('select').not('.interestType').val('');
    cloneTr.find('select').not('.interestType').removeClass('is-valid');
    cloneTr.find('select').not('.interestType').removeClass('is-invalid');
    cloneTr.find('select').not('.interestType').closest('span').html('');
    cloneTr.find('select').not('.interestType').selectpicker('destroy');

    cloneTr.find('.bootstrap-select').replaceWith(function () { return $('select', this); });

    cloneTr.find('select option.bs-title-option').not('.interestType').remove();
    cloneTr.find('select').not('.interestType').selectpicker('refresh');
    cloneTr.find('.additional-fields').addClass('d-none');

    cloneTr.find('.profitVal').html("");    
    cloneTr.find('.installVal').html("");    
    cloneTr.find('.taxVal').html("");    
    $('.productSelectTable tbody').append(cloneTr);
});

/**
 * Product selection add active class
 */
$(document).on('click change', '.toggle-element2,.toggle-element', function (event) {
    let element = $(this);
    element.closest('.toggle-elements').find('.caps').removeClass('active');
    element.addClass('active');

    if (element.hasClass('change_options')) {
        updateRemoveOptions(element);
    } else if (element.hasClass('change_modifiers')) {
        updateRemoveModifiers(element);
    }

    updateCustomizeHeaders();
});

/**
 * Remove Line Item
 */
$(document).on('click', '.removelineitem', function () {
    let productTr = $(this).closest('tr');
    let productTbody = $(this).closest('tbody');
    $.confirm({
        title: 'Are you sure you want to delete this product?',
        content: '',
        escapeKey: 'cancelAction',
        buttons: {
            confirm: {
                btnClass: 'btn-red',
                text: 'Ok',
                action: function () {
                    if (productTbody.find('tr').length == 1) {
                        $('.addmoreproduct').trigger('click');
                    }
                    productTr.remove();

                    $.each($('select.product'), function (index, value) {
                        selectedProduct[index] = $(value).val();
                    });

                    updateDeleteProductSelection();
                }
            },
            cancelAction: {
                text: 'Cancel',
                action: function () {
                    /** */
                }
            }
        }
    });
});

/**
 * Change quantity and update price and also check for bulk discount
 */
$(document).on('change keyup blur', '.qty', function () {
    let element = $(this);
    let product_id = element.closest('tr').attr('id');

    if (product_id !== undefined) {
        let qty = element.val();
        if (parseInt(qty) == 0 || isNaN(qty)){
            qty = 0;
        }
        productSelection[product_id]['quantity'] = qty;
        updateProductPriceImage(product_id);
    }
});


$("#saveNewQuote").click(function () {
    var data = $("#newQuoteCreate").serializeArray();

    $.ajax({
        url: createQuotesUrl,
        async: false,
        data: data,
        type: 'post',
        dataType: 'json',

        beforeSend: function () {
            $('.loader').show();
        },
        success: function (response) {
            result = response;
        },
        complete: function () {
            $('.loader').hide();
        }
    });

});

$("#submit_sent_date").click(function () {
    var updateDateSent = '/quotes/bcquote/update-date-sent';
    var sentDateValue = $("#sent_date").val();
    var quote_id = $("#example").attr('data-id');

    if ((sentDateValue !== null && sentDateValue !== '')) {
        var url = updateDateSent;
        var jsonData = {
            "date_sent": sentDateValue,
            "quote_id": quote_id
        }
        var fetchQuotesResult = function (result) {
            if (result.code != 200) {
                errorToastr(result.response);
                return false;
            }
            $("#close_date_sent_slide").click();
            $("#sent_date").val("");
            $("#example[data-id='" + quote_id + "']").text(sentDateValue);
        }
        callAjaxFunction(url, jsonData, fetchQuotesResult, 'Post');
    } else {
        $("#close_date_sent_slide").click();
    }

});

var formSubmitHandler = function (response) {
    if (response.code == 200) {   
        successToastr('Quotes saved succesfully.');
        window.location.href = BASE_URL + "/quotes/bcquote/"+response.response.id+"/edit";
    } else {
        errorToastr('Unable to save quote try again. Try again or later.');
    }
}

function arrayToJson(arr) {
    return JSON.stringify(arr, function (key, value) {
        if (value instanceof Array || value instanceof Object) {
            return Object.keys(value).sort().reduce(function (sorted, key) {
                sorted[key] = value[key];
                return sorted;
            }, {});
        }
        return value;
    });
}

function openFileUploader() {
    const fileInput = document.getElementById('fileInput');
    fileInput.click();

    fileInput.addEventListener('change', function () {
        displayImage(this);
    });
}

function displayImage(input) {
    const imagePreview = document.getElementById('imagePreview');

    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;
            img.style.width = '120px'; // Adjust the width as needed
            img.style.height = 'auto'; // Maintain aspect ratio
            imagePreview.innerHTML = ''; // Clear previous image (if any)
            imagePreview.appendChild(img);
        };

        reader.readAsDataURL(input.files[0]);
    }
}

//Create or remove unchecked product array's by their ID
function updateDeleteProductSelection() {
    //var currentProduct = Array.from({ length: 2000 }, (_, index) => 0);
    var currentProduct = {};

    //Get all the selected products
    $.each($('select.product'), function (index, value) {
        let productId = $(value).val();
        currentProduct[productId] = productId;
        let categoryId = $(value).closest('div.productDiv').prev('div.categoryDiv').find('select option:selected');
        let qty = $(value).closest('tr').find('.qty').val();

        if (isNaN(parseInt(qty))) {
            qty = 1;
            $(value).closest('tr').find('.qty').val(qty);
        }

        if (productId !== undefined && productId != '') {
            //Create a new product ID array
            if (productSelection[productId] == undefined) {
                productSelection[productId] = {};
                productSelection[productId]['quantity'] = qty;
                productSelection[productId]['category_id'] = categoryId.val();
                productSelection[productId]['bc_category_id'] = categoryId.data('bc-cat-id');

                if (customerGroupDiscount !== undefined && customerGroupDiscount !== null){
                    getCustomerGroupDiscount(productId);
                }
            }
        }
      
    });
}

function updateProductPriceImage(productId) {
    productSelection[productId]['base_price'] = dbProductInfo[productId]['calculated_price'];
    var installType = $('input[name="tax_type"]:checked').val();

    /** Get Variant Option price and images of product */
    let selectedVariant;
    if(productSelection[productId]['options'] !== undefined){
        let selectedOptions = productSelection[productId]['options'];
    
        //let optionSelected = Array.from({ length: 100 }, (_, index) => []);
        let optionSelected = '';
    
        $.each(selectedOptions, function (index, value) {
            if (value != undefined) {
                if(index==0){
                    optionSelected = value.data_option    
                } else {
                    optionSelected = optionSelected + '_'+value.data_option;    
                }
            }
        });
        
        let variantOptionSelected = optionSelected;
        selectedVariant = dbProductInfo[productId].variant.find(item => {
            if (item.options == variantOptionSelected) {
                return item;
            }
        })
    }

    let productCustomizeInfo = "";
    let productCustomizeTableInfo = "";

    //Show the selected variants / modifiers description 
    if (selectedVariant != undefined) {
        productSelection[productId]['base_price'] = parseFloat(selectedVariant.calculated_price);
        productSelection[productId]['total_price'] = parseFloat(selectedVariant.calculated_price);

        productSelection[productId]['variant'] = {};
        productSelection[productId]['variant']['id'] = selectedVariant.id;
        productSelection[productId]['variant']['sku'] = selectedVariant.sku;
        productSelection[productId]['variant']['image'] = selectedVariant.image_url;
        productSelection[productId]['variant']['price'] = selectedVariant.calculated_price;
        productSelection[productId]['variant']['option_values'] = JSON.parse(selectedVariant.option_values);
        
        $.each(productSelection[productId]['variant']['option_values'], function (index, value) {
            productCustomizeInfo += "<p>" + value.option_display_name + ": " + value.label + "</p>";
            productCustomizeTableInfo += "<li>" + value.option_display_name + ": " + value.label + "</li>";
        })
      
    }

    /** Get modifiers price of product */

    if (productSelection[productId]['modifiers'] !== undefined) {
        let selectedModifiers = productSelection[productId]['modifiers'];

        $.each(selectedModifiers, function (index, value) {
            let price = productSelection[productId]['base_price'];
            if (value !== undefined) {
                productCustomizeInfo += "<p>" + value.display_name + ": " + value.selected_option + "</p>";
                if(value.selected_option != undefined){
                    productCustomizeTableInfo += "<li>" + value.display_name + ": " + value.selected_option + "</li>";
                }else{
                    productCustomizeTableInfo += "<li>" + value.display_name + ": " + value.input_text_value + "</li>";
                }

                if (value.price !== undefined && value.price !== 0) {
                    if (value.price_type == "relative") {
                        price = parseFloat(price) + parseFloat(value.price)
                    } else {
                        price = (parseFloat(value.price) / 100) * parseFloat(price)
                    }
                }

                productSelection[productId]['base_price'] = parseFloat(price).toFixed(2);
                productSelection[productId]['total_price'] = parseFloat(price).toFixed(2);
            }
        });
    }
    let productCustomizeTableInfoData = $('.productSelectTable tr#' + productId);
    productCustomizeTableInfoData.find('td:nth-child(4) .item-dropdown-data-unit .on-hover-true-cost .addCost').attr('data-id',productId);
    productCustomizeTableInfoData.find('td:nth-child(4) .item-dropdown-data-unit .on-hover-true-cost ul').addClass('popover_content_list_'+productId);

    if (selectedVariant != undefined) {
        let productCustomizeInfoData = $('#menu .productCustomizeInfoData');
        
        if(productSelection[productId]['variant']['image']!=''){
            productCustomizeInfoData.find('img').attr('src', productSelection[productId]['variant']['image']);
        }
        // productCustomizeInfoData.find('p').remove();
        // productCustomizeInfoData.append(productCustomizeInfo);


        
        productCustomizeTableInfoData.find('.descriptionDiv ul').find('li').not('li:first-child').remove();
        productCustomizeTableInfoData.find('.descriptionDiv ul').append(productCustomizeTableInfo);
        if(productSelection[productId]['variant']['image']!=''){
            productCustomizeTableInfoData.find('td:nth-child(2) img').attr("src", productSelection[productId]['variant']['image']);
        }
        
    }
    

    /** Calculate BulkPricing */
    let Qty = productSelection[productId]['quantity'];

    if (parseInt(Qty) !== undefined) {
        let discount = dbProductInfo[productId].bulkpricing.find(item => {
            if (item.quantity_max > 0) {
                if (item.quantity_min <= Qty && item.quantity_max >= Qty) {
                    return item;
                }
            } else {
                if (item.quantity_min <= Qty) {
                    return item;
                }
            }
        });

        let basePrice = productSelection[productId]['base_price'];        
        if (discount !== undefined && productSelection[productId]['base_price'] !== undefined) {
            if (discount.type == "percent") {
                basePrice = basePrice - (discount.amount / 100) * basePrice;
            } else if (discount.type == "price") {
                basePrice = basePrice - discount.amount;
            } else {
                basePrice = discount.amount;
            }

            productSelection[productId]['base_price'] = parseFloat(basePrice).toFixed(2);
        }
        productSelection[productId]['total_price'] = parseFloat(basePrice * Qty).toFixed(2);
    }

    if (productSelection[productId]['group_discount'] !== undefined){

        let basePrice = productSelection[productId]['base_price'];

        let method = productSelection[productId]['group_discount']['method'];
        let amount = productSelection[productId]['group_discount']['amount'];

        if (method == "percent"){
            amount = basePrice - ((amount / 100) * basePrice);
        } else if (method == "price"){
            amount = basePrice - amount;
        }

        productSelection[productId]['base_price'] = parseFloat(amount).toFixed(2);

        productSelection[productId]['total_price'] = parseFloat(amount * Qty).toFixed(2);

    }

    if (productSelection[productId]['additional'] !== undefined){

        let price = parseFloat(productSelection[productId]['base_price']);
        let trueCost = 0;

        let additional = productSelection[productId]['additional'];
        if(additional['profit'] !== undefined){
            let profit = additional['profit'];
            let profitAmount = parseFloat(profit['value']);
            let profitType = profit['type'];

            let profitTotal = profitAmount;
            if(profitType != "fee_per_item"){
                profitTotal = parseFloat(price * (profitAmount / 100)).toFixed(2);
            }

            productSelection[productId]['additional']['profit']['total'] = profitTotal;
        }

        if(additional['install'] !== undefined){
            let install = additional['install'];
            let installAmount = parseFloat(install['value']);
            let installType = install['type'];
            let installTotal = installAmount;
            if(installType != "Amount"){
                installTotal = parseFloat(price * (installAmount/100)).toFixed(2);
            }
            productSelection[productId]['additional']['install']['total'] = installTotal;
        }

        if(additional['tax'] !== undefined){

            let tax = additional['tax'];
            let taxAmount = parseFloat(tax['value']);
            let taxType = tax['type'];
            if(taxType == "PRODUCT"){     
                let productTax = 0;           
                if(productSelection[productId]['additional']['profit'] !== undefined){
                    let productProfit = parseFloat(productSelection[productId]['additional']['profit']['total']);
                    productProfit = parseFloat(productProfit) + price;

                    productTax = parseFloat(parseFloat(productProfit) * (taxAmount / 100) + parseFloat(productProfit)).toFixed(2);

                    productSelection[productId]['additional']['tax']['product_tax'] = productTax;

                }

                trueCost = parseFloat(productTax) + price;

                // trueCost = parseFloat(parseFloat(trueCost) * (taxAmount/100) + parseFloat(trueCost)).toFixed(2);

                if(productSelection[productId]['additional']['install'] !== undefined && installType == "BLENDED"){
                    trueCost = parseFloat(trueCost) + parseFloat(productSelection[productId]['additional']['install']['total']);
                }
                
            } else if(taxType == "PRODUCT_LABOR"){
                let productTax = 0;
                if(productSelection[productId]['additional']['profit'] !== undefined){
                    let productProfit = parseFloat(productSelection[productId]['additional']['profit']['total']);
                    
                    productProfit = parseFloat(productProfit) + price;

                    productTax = parseFloat(parseFloat(productProfit) * (taxAmount / 100) + parseFloat(productProfit)).toFixed(2);

                    productSelection[productId]['additional']['tax']['product_tax'] = productTax;

                }

                let installTax = 0;
                if(productSelection[productId]['additional']['install'] !== undefined && installType == "BLENDED"){
                    let installCost = parseFloat(productSelection[productId]['additional']['install']['total']);

                    installTax = parseFloat(parseFloat(installCost) * (taxAmount / 100) + parseFloat(installCost)).toFixed(2);

                    productSelection[productId]['additional']['tax']['install_tax'] = installTax;
                }

                trueCost = parseFloat(productTax) + parseFloat(installTax);

                // trueCost = parseFloat(parseFloat(trueCost) * (taxAmount/100) + parseFloat(trueCost)).toFixed(2);
            }
            
        } else {
            if(productSelection[productId]['additional']['profit'] !== undefined){
                trueCost = parseFloat(productSelection[productId]['additional']['profit']['total']);
            }

            if(productSelection[productId]['additional']['install'] !== undefined && installType == "BLENDED"){
                trueCost = parseFloat(trueCost) + parseFloat(productSelection[productId]['additional']['install']['total']);    
            }

            trueCost = parseFloat(trueCost) + price;
        }
        
        productSelection[productId]['true_cost'] = trueCost;
        if(trueCost > 0){
            productSelection[productId]['true_cost'] = trueCost;
            productSelection[productId]['total_price'] = trueCost * Qty;
        }
    }

    if (productSelection[productId]['base_price'] !== undefined) {
        let price = productSelection[productId]['base_price'];
        let totalPrice = productSelection[productId]['total_price'];          
        let productArray = dbProductInfo[productId];
        var productCustomizeInfoData = $('#menu .productCustomizeInfoData');
        productCustomizeInfoData.find('h3').html(productArray.name + " (" + formatter.format(price) + ")");


        let productCustomizeTableInfoData = $('.productSelectTable tr#' + productId);
        productCustomizeTableInfoData.find('.baseprice').html(formatter.format(price));
        if(productSelection[productId]['true_cost'] === undefined || parseFloat(productSelection[productId]['true_cost']) == 0){
            productCustomizeTableInfoData.find('.addCost').html("");
        } else {
            let trueCost = productSelection[productId]['true_cost'];
            productCustomizeTableInfoData.find('.addCost').html("Cost "+formatter.format(trueCost));
        }
        productCustomizeTableInfoData.find('.baseprice').html(formatter.format(price));
        productCustomizeTableInfoData.find('.totalprice').html(formatter.format(totalPrice));
    }

    calculateOverAllTotal();
}

$(document).on('change', '.addProfitValue, .addProfitType', function(){
    let element = $(this);
    let productId = element.closest('tr').attr('id');
    if (productSelection[productId]['additional'] === undefined) {
        productSelection[productId]['additional'] = {};
    }
    if (productSelection[productId]['additional']['profit'] === undefined) {
        productSelection[productId]['additional']['profit'] = {};
    }

    let profitElement = element.closest('div.input-group');

    let amount = profitElement.find('input.addProfitValue').val();
    let type = profitElement.find('select.addProfitType').val();

    if (amount == "" || isNaN(amount)) {
        productSelection[productId]['additional']['profit']['value'] = 0;
    } else {
        productSelection[productId]['additional']['profit']['value'] = parseFloat(amount).toFixed(2);        
    }

    productSelection[productId]['additional']['profit']['type'] = type;
    updateProductPriceImage(productId);
})


$(document).on('mouseenter', '.addCost', function(){

    // alert($(this).data('id'))
    let element = $(this);
  
    let tr = element.closest('tr');
    let productId = tr.attr('id');

    let productData = productSelection[productId];
    
    if(productData['additional'] !== undefined){    
        if(productSelection[productId]['additional']['profit'] !== undefined){
            let amount = productSelection[productId]['additional']['profit']['value'];             

            // let interestType = $('.interestType').val();
            let type = productSelection[productId]['additional']['profit']['type'];              

            if(type == 'fee_per_item'){
                if(amount == 0){
                    $('#'+productId).find('.popover_content_list').find('.profitVal').html("");
                }else{
                                    
                    $('#'+productId).find('.popover_content_list').find('.profitVal').html("Profit : <span>"+ 
                    formatter.format(amount) + "</span>");
                }
            }else{
                 $('#'+productId).find('.popover_content_list').find('.profitVal').html("Profit : <span>"+ 
                + amount + "%</span>");
            }
        }

        if(productSelection[productId]['additional']['install'] !== undefined){
            let intallAmount = productSelection[productId]['additional']['install']['value'];

            if(intallAmount == 0){
                $('#'+productId).find('.popover_content_list').find('.installVal').html("");
            }else{
                $('#'+productId).find('.popover_content_list').find('.installVal').html("Install Rate : <span>"+formatter.format(intallAmount) + "</span>");
            }
        }

        if(productSelection[productId]['additional']['tax'] !== undefined){
            let taxAmount = productSelection[productId]['additional']['tax']['value'];        
                
            if(taxAmount == 0){
                $('#'+productId).find('.popover_content_list').find('.taxVal').html("");    
            }else{
                $('#'+productId).find('.popover_content_list').find('.taxVal').html("Tax : <span>"+ taxAmount + "%</span>");    
            }      
        }

    }

});


$(document).on('change', '.seperateLine', function() {
    let element = $(this);    
    let value = element.val(); 
    // if (value == "SEPARATE_LINE") {        
    //     element.closest('div').next('div').removeClass('d-none');
    // } else {
    //     element.closest('div').next('div').addClass('d-none');
    // }

    reTotalAllProduct();
})

$(document).on('change', '.installValue, .installType', function(){
    let element = $(this);
    let productId = element.closest('tr').attr('id');
    if(productSelection[productId]['additional'] === undefined){
        productSelection[productId]['additional'] = {};
    }
    if(productSelection[productId]['additional']['install'] === undefined){
        productSelection[productId]['additional']['install'] = {};
    }

    let interestElement = element.closest('div.input-group');

    let amount = interestElement.find('input.installValue').val();
    let type = "Amount";

    if(amount == "" || isNaN(amount)){
        productSelection[productId]['additional']['install']['value'] = 0;
    } else {
        productSelection[productId]['additional']['install']['value'] = parseFloat(amount).toFixed(2);        
    }
    
    productSelection[productId]['additional']['install']['type'] = type;
    updateProductPriceImage(productId);
})

$(document).on('change', '.taxValue, .taxType', function(){
    let element = $(this);
    let productId = element.closest('tr').attr('id');
    if (productSelection[productId]['additional'] === undefined) {
        productSelection[productId]['additional'] = {};
    }
    if (productSelection[productId]['additional']['tax'] === undefined) {
        productSelection[productId]['additional']['tax'] = {};
    }

    let taxElement = element.closest('div.input-group');

    let amount = taxElement.find('input.taxValue').val();
    let type = taxElement.find('select.taxType').val();

    if (amount == "" || isNaN(amount)) {
        productSelection[productId]['additional']['tax']['value'] = 0;
    } else {
        productSelection[productId]['additional']['tax']['value'] = parseFloat(amount).toFixed(2);
    }

    productSelection[productId]['additional']['tax']['type'] = type;
    updateProductPriceImage(productId);
});

function updateProductSelection(productId) {
    if (productSelection[productId] !== undefined) {
        let selectedCustomize = productSelection[productId];

        if (selectedCustomize['variant'] !== undefined && selectedCustomize['variant'] !== null) {
            let selectedVariant = selectedCustomize['variant'];

            let productCustomizeInfoData = $('#menu .productCustomizeInfoData');
            if (selectedVariant['image'] != ""){
                productCustomizeInfoData.find('img').attr('src', selectedVariant['image']);
            }

            let productCustomizeInfo = "";
            $.each(selectedVariant['option_values'], function (index, value) {
                productCustomizeInfo += "<p>" + value.option_display_name + ": " + value.label + "</p>";
            });


            if (productSelection[productId]['modifiers'] !== undefined) {
                let selectedModifiers = productSelection[productId]['modifiers'];
                $.each(selectedModifiers, function (index, value) {
                    if (value !== undefined) {
                        productCustomizeInfo += "<p>" + value.display_name + ": " + value.selected_option + "</p>";
                    }
                });
            }

            // productCustomizeInfoData.find('p').remove();
            // productCustomizeInfoData.append(productCustomizeInfo);
        }

        if (selectedCustomize['options'] !== undefined && selectedCustomize['options'] !== null) {
            let selectedOptions = selectedCustomize['options'];

            $.each(selectedOptions, function (index, value) {
                if (value !== undefined) {
                    $('.change_options[data-option=' + value.data_option + ']').addClass('active');
                }
            });

        }

        if (selectedCustomize['modifiers'] !== undefined && selectedCustomize['modifiers'] !== null) {
            let selectedModifiers = selectedCustomize['modifiers'];
            $.each(selectedModifiers, function (index, value) {
                if (value !== undefined) {
                    $('.change_modifiers[data-id="'+value.id+'"]').val(value.input_text_value).addClass('active');
                    $('.change_modifiers[data-option=' + value.data_option + ']').addClass('active');
                }
            });

        }

    }

    if (productSelection[productId]['base_price'] !== undefined) {
        let price = productSelection[productId]['base_price'];
        let productArray = dbProductInfo[productId];
        var productCustomizeInfoData = $('#menu .productCustomizeInfoData');
        productCustomizeInfoData.find('h3').html(productArray.name + " (" + formatter.format(price) + ")");
    }
}

function menuToggle(productId) {
    let productArray = dbProductInfo[productId];
    let productImages = productArray.images;
    let productVariantOptions = productArray.variant_option;

    let productImg = productImages.find(item => {
        if (item.is_thumbnail == 1) {
            return item;
        }
    });


    var productCustomizeInfoData = $('#menu .productCustomizeInfoData');
    var productCustomizeData = $('#menu .productCustomizeData');

    // productCustomizeInfoData.find('p').remove();
    productCustomizeInfoData.find('h3').html(productArray.name);
    productCustomizeInfoData.find('img').attr('src', productImg.url_standard);

    var customizeHtml = "";
    $.each(productVariantOptions, function (index, variantinfo) {

        customizeHtml += '<div class="card">\
                <div class="card-header" id="heading'+ index + '">\
                    <button class="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse" data-target="#collapse'+ index + '" aria-expanded="true" aria-controls="collapseOne">\
                        <h3 class="sub-heading" class="m-0"> '+ variantinfo.display_name + ' <span></span></h3>\
                    </button>\
                </div>\
                <div id="collapse'+ index + '" class="collapse" aria-labelledby="heading' + index + '"\
                    data-parent="#accordionExample">\
                    <div class="card-body">\
                        <div class="toggle-elements">';
        if (variantinfo.type == "swatch") {
            $.each(variantinfo.variant_option_value, function (subindex, variantinfovalue) {
                let optionValue = JSON.parse(variantinfovalue.value_data);
                if (optionValue.image_url !== undefined) {
                    customizeHtml += '<div class="caps toggle-element2 change_' + strtolower(variantinfo.options_type) + '" data-id="' + variantinfo.id + '" data-value=' + variantinfovalue.id + ' data-option="' + variantinfo.variant_option_id + '_' + variantinfovalue.variant_option_value_id + '" data-sort="' + variantinfo.sort_order + '">\
                            <img src="'+ optionValue.image_url + '" onerror="this.src=\'https://dummyimage.com/640x4:3/\'" class="img-fluid rounded" alt="dummy">\
                                <p class="text-center">'+ variantinfovalue.label + '</p>\
                        </div>';
                } else {
                    customizeHtml += '<div class="caps toggle-element2 change_' + strtolower(variantinfo.options_type) + '" data-id="' + variantinfo.id + '" data-value=' + variantinfovalue.id + ' data-option="' + variantinfo.variant_option_id + '_' + variantinfovalue.variant_option_value_id + '" data-sort="' + variantinfo.sort_order + '">\
                            <span class="img-fluid rounded" style="display: flex; border:1px solid black; height:100px; width:100px; background-color:'+ optionValue.colors[0] + '" title="{{$variantinfovalue->label}}"></span>\
                                <p class="text-center">'+ variantinfovalue.label + '</p>\
                        </div>';
                }
            });
        } else if (variantinfo.type == "dropdown") {
            $.each(variantinfo.variant_option_value, function (subindex, variantinfovalue) {
                customizeHtml += '<div class="caps toggle-element number-elements change_' + strtolower(variantinfo.options_type) + '" data-id="' + variantinfo.id + '" data-value=' + variantinfovalue.id + ' data-option="' + variantinfo.variant_option_id + '_' + variantinfovalue.variant_option_value_id + '" data-sort="' + variantinfo.sort_order + '">' + variantinfovalue.label + '</div>';
            });
        } else if (variantinfo.type == "text"){
            customizeHtml += '<input type="text" class="form-control toggle-element change_' + strtolower(variantinfo.options_type) + '" data-id="' + variantinfo.id + '" data-sort="' + variantinfo.sort_order + '"/>';
        }

        customizeHtml += '</div>\
                    </div>\
                </div>\
            </div>';
    });

    productCustomizeData.html(customizeHtml);
}

var fetchProduct = function (result, element) {

    let productDiv = element.closest('div.categoryDiv').next('div.productDiv');
    let additionalDiv = element.closest('td').find('div.additional-field');
    var productHtml = "";
    if (result.code == 200) {

        $.each(result.response, function (index, value) {
            productHtml += "<option value='" + value.id + "'>" + value.name + "</option>";
        });

    } else {
        errorToastr('No Product found. Try again or later.');
    }

    if (productDiv.hasClass('d-none')) {
        productDiv.toggleClass('d-none');
    }

    if (!additionalDiv.hasClass('d-none')) {
        additionalDiv.addClass('d-none');
    }

    productDiv.find('select').html(productHtml);
    productDiv.find('select').selectpicker('refresh');
}

var fetchProductDetail = function (result, element) {

    let productId = element.val();
    let toggleButton = element.closest('div.productDiv').next('div.descriptionDiv');

    if (result.code != 200) {
        errorToastr(result.response);
        return false;
    }

    dbProductInfo[productId] = result.response;
    updateDeleteProductSelection();

    if (productSelection[productId] === undefined) {
        productSelection[productId] = {};
    }

    productSelection[productId]['product_id'] = productId;
    productSelection[productId]['base_price'] = parseFloat(dbProductInfo[productId]['calculated_price']);
    productSelection[productId]['total_price'] = parseFloat(dbProductInfo[productId]['calculated_price']);

    let productName = dbProductInfo[productId].name;
    let productImg = dbProductInfo[productId].images.find(item => {
        if (item.is_thumbnail == 1) {
            return item;
        }
    });

    element.closest('tr').attr('id', productId);
    toggleButton.find('h3').html(productName);

    let productDisplayImg = "";
    if (productImg !== undefined && productImg !== null) {
        element.closest('tr').find('img').attr('src', productImg.url_standard);
        productDisplayImg = productImg.url_standard;
    } else {
        element.closest('tr').find('img').attr('src', "");
    }
    
    productSelection[productId]['image'] = productDisplayImg;

    if (dbProductInfo[productId].variant_option !== undefined && dbProductInfo[productId].variant_option !== null && dbProductInfo[productId].variant_option.length != 0) {
        
        if (toggleButton.hasClass('d-none')) {
            toggleButton.toggleClass('d-none');
        }
        toggleButton.find('.menuToggle').data('product_id', productId);
    } else {
        if (!toggleButton.hasClass('d-none')) {
            toggleButton.toggleClass('d-none');
        }
    }

    let additionalDiv = element.closest('tr').find(".additional-fields");

    if (additionalDiv.hasClass('d-none')){
        additionalDiv.toggleClass('d-none');
    }

    additionalDiv.find('.taxValue').trigger('change');
    additionalDiv.find('.nav-link').removeClass('active');
    additionalDiv.find('.nav-link').attr('aria-selected','false');
    additionalDiv.find('.tab-pane').removeClass('show');
    additionalDiv.find('.tab-pane').removeClass('active');
    additionalDiv.find(".product-profit-tab").attr("href", function(_, currentHref) { return currentHref + productId; });
    additionalDiv.find(".interest-rate-tab").attr("href", function(_, currentHref) { return currentHref + productId; });
    additionalDiv.find(".open-tax-tab").attr("href", function(_, currentHref) { return currentHref + productId; });
    additionalDiv.find(".product-profit-field").attr("id", function(_, currentHref) { return currentHref + productId; });
    additionalDiv.find(".interest-rate-field").attr("id", function(_, currentHref) { return currentHref + productId; });
    additionalDiv.find(".open-tax-field").attr("id", function(_, currentHref) { return currentHref + productId; });
    
    if (productSelection[productId]['additional'] !== undefined){

    } else {
        additionalDiv.find('select').prop("selectedIndex", 0);
        additionalDiv.find('input').val("");
    }
    updateProductPriceImage(productId);
};

/**
 * Get variantinfo and change product price and images
 */
var updateRemoveOptions = function (element) {

    let product_id = SelectedProductId;
    let variantoption = element.attr('data-id')
    let value = element.attr('data-value')
    let option = element.attr('data-option')
    let sort = element.attr('data-sort')

    if (productSelection[product_id]['options'] === undefined) {
        //productSelection[product_id]['options'] = Array.from({ length: 100 }, (_, index) => []);
        productSelection[product_id]['options'] = {};
    }

    if (productSelection[product_id]['options'][sort] === undefined) {
        //productSelection[product_id]['options'][sort] = [];
        productSelection[product_id]['options'][sort] = {};
    }

    productSelection[product_id]['options'][sort]['id'] = variantoption;
    productSelection[product_id]['options'][sort]['value_id'] = value;
    productSelection[product_id]['options'][sort]['data_option'] = option;

    updateProductPriceImage(product_id);
};

/**
 * Get modifierinfo and update product price
 */
var updateRemoveModifiers = function (element) {
    let product_id = SelectedProductId;
    let modifieroption = element.attr('data-id')
    let value = element.attr('data-value')
    let option = element.attr('data-option')
    let sort = element.attr('data-sort')
    let headingValue = element.val();
    
    if (productSelection[product_id]['modifiers'] === undefined) {
        //productSelection[product_id]['modifiers'] = Array.from({ length: 100 }, (_, index) => []);
        productSelection[product_id]['modifiers'] = {};
    }
    if (productSelection[product_id]['modifiers'][sort] === undefined) {
        //productSelection[product_id]['modifiers'][sort] = [];
        productSelection[product_id]['modifiers'][sort] = {};
    }
    productSelection[product_id]['modifiers'][sort]['id'] = modifieroption;
    productSelection[product_id]['modifiers'][sort]['value_id'] = value;
    productSelection[product_id]['modifiers'][sort]['data_option'] = option;
    if(element.attr('type') != undefined && element.attr('type') == "text"){
        productSelection[product_id]['modifiers'][sort]['input_text_value'] = headingValue;
    }



    let modifiers = dbProductInfo[product_id].variant_option.find(function (item) {
        if (item.options_type == "MODIFIERS" && item.id == modifieroption && item.sort_order == sort) {
            if(item.variant_option_value.length > 0){
                return item.variant_option_value.find(subitem => {

                    if (subitem.id == value) {
                        let returnitem = item;
    
                        returnitem.selected = {};
                        returnitem.selected = subitem;
                        
                        if (subitem.adjusters !== undefined && typeof subitem.adjusters != 'object') {
                            returnitem.selected.adjusters = JSON.parse(returnitem.selected.adjusters);
                        }
    
                        return returnitem;
                    }
    
                })
            } else {
                return item;
            }
        }
    })

    productSelection[product_id]['modifiers'][sort]['display_name'] = modifiers.display_name;

    if (modifiers != undefined && modifiers.selected !== undefined) {
        productSelection[product_id]['modifiers'][sort]['selected_option'] = modifiers.selected.label;

        if (modifiers.selected.adjusters !== undefined && modifiers.selected.adjusters.price !== undefined && modifiers.selected.adjusters.price !== null) {
            productSelection[product_id]['modifiers'][sort]['price'] = modifiers.selected.adjusters.price.adjuster_value;
            productSelection[product_id]['modifiers'][sort]['price_type'] = modifiers.selected.adjusters.price.adjuster;
        } else {
            productSelection[product_id]['modifiers'][sort]['price'] = 0;
            productSelection[product_id]['modifiers'][sort]['price_type'] = null;
        }
    }

    updateProductPriceImage(product_id);
};

function addDateSent() {
    if ($('#add-update-options-quote-canvas').hasClass('overflow-auto')) {
        $('#add-update-options-quote-canvas').removeClass('overflow-auto');
    }
    $('#add-update-options-quote-canvas').offcanvas('show');
}

function initAutocomplete() {
    address1Field = document.querySelector("#address1");
    address2Field = document.querySelector("#address2");
    postalField = document.querySelector("#pincode");
    // Create the autocomplete object, restricting the search predictions to
    // addresses in the US and Canada.
    /**
     * {
    componentRestrictions: {country: ["us", "ca"] },
    fields: ["address_components", "geometry"],
    types: ["address"],
        }
    */
    autocomplete = new google.maps.places.Autocomplete(address1Field, {
        componentRestrictions: { country: ["us", "ca"] }
    });
    // address1Field.focus();
    autocomplete.addListener("place_changed", fillInAddress);
}

function fillInAddress() {
    // Get the place details from the autocomplete object.
    const place = autocomplete.getPlace();

    let address1 = "";
    let postcode = "";

    for (const component of place.address_components) {
        const componentType = component.types[0];

        switch (componentType) {
            case "street_number": {
                address1 = `${component.long_name} ${address1}`;
                break;
            }
            case "route": {
                address1 += component.short_name;
                break;
            }
            case "postal_code": {
                postcode = `${component.long_name}${postcode}`;
                break;
            }
            case "postal_code_suffix": {
                postcode = `${postcode}-${component.long_name}`;
                break;
            }
            case "locality":
                document.querySelector("#city").value = component.long_name;
                break;
            case "administrative_area_level_1": {
                document.querySelector("#state").value = component.short_name;
                break;
            }
            case "country":
                document.querySelector("#country").value = component.long_name;
                break;
        }
    }

    address1Field.value = address1;
    postalField.value = postcode;
    address2Field.focus();
}

//  Add,View and Delete Quote Notes
$(document).on('click', '.quoteNotes', function(){
    let element = $(this);
    if ($('#add-new-extras').hasClass('overflow-auto')) {
        $('#add-new-extras').removeClass('overflow-auto');
    }
    $('#add-new-extras').offcanvas('show');

    let quoteId = element.data('quoteid');

    $('#sent_note').val("");

    fetchQuoteNotes(quoteId);
});

function fetchQuoteNotes(quoteId) {

    var fetchNotes = function (response){
        let result = response.response;
        let notesHtml = "";
        if (response.code == 200) {
            $.each(result, function (index, value) {
                notesHtml += "<tr id="+quoteId+">\
                <!--td>"+ value.user.first_name + " " + value.user.last_name + "</td-->\
                <td>"+ value.notes + "</td>\
                <td>"+ dateTimeFormat(value.created_at) + "</td>\
                <td><a class='primary btn-action btn btn-success btn-circle quote-notes-delete-button' style='padding-top:12px' data-id="+ value.id + "><i class='fa fa-solid fa-trash'></i></a></td>\
                </tr>";
            });
        }

        $('#quoteNotesTable tbody').html(notesHtml);
        $('#submit_note').attr('quote_id', quoteId);
    }

    var url = "/quotes/bcquote/view-quote-notes/" + quoteId;
    callAjaxFunction(url, {}, fetchNotes, 'GET');
    
}

$(document).on("click", ".quote-notes-delete-button", function () {
    let element = $(this);
    var quoteNoteId = element.data('id');

    var url = '/quotes/bcquote/delete-quote-notes/' + quoteNoteId;
    
    var deleteQuoteNotes = function (response, element) {
        let result = response.response;
        if (response.code == 200){
            successToastr('Quote Notes deleted succesfully.');
            let quoteId = element.closest('tr').attr('id');
            $('.quoteNotes[data-quoteid=' + quoteId +']').trigger('click');
        } else {
            errorToastr(result);
        }
    };
    callAjaxFunction(url, {}, deleteQuoteNotes, 'GET', element);
  
});

// Delete Quote

function showDeleteConfirmationModal(confirmCallback) {
    $.confirm({
        title: 'Are you sure you want to delete this Quote?',
        content: '',
        escapeKey: 'cancelAction',
        buttons: {
            confirm: {
                btnClass: 'btn-red',
                text: 'Ok',
                action: confirmCallback 
            },
            cancelAction: {
                text: 'Cancel',
                action: function () {
                }
            }
        }
    });
}

$(document).off('click', '.quote-delete-button').on("click", ".quote-delete-button", function () {
    var quoteId = $(this).data('id');
    var url = '/quotes/bcquote/delete-quote/' + quoteId;

    showDeleteConfirmationModal(function () {
        var deleteQuoteCallback = function (result) {
            successToastr('Quote deleted successfully.');
        };

        callAjaxFunction(url, {}, deleteQuoteCallback, 'GET');

        setTimeout(function () {
            location.reload();
        }, 1000);
    });
});

// Update Quote Status
$(document).on("change", ".quote-status", function () {
    var selectedValue = $(this).val();
    var quoteId = $(this).data("id");
  
    var url = '/quotes/bcquote/update-quote-status/' + quoteId;
    var jsonData = {
        status: selectedValue,
        id: quoteId,
    };
    var updateQuote = function (result) {  
        successToastr('Quote Status updated succesfully.');
    };
    callAjaxFunction(url, jsonData, updateQuote,'POST');
    
});

function getCustomerGroupDiscount(product_id){
    if (customerGroupDiscount.discount !== undefined){
        let discountRules = customerGroupDiscount.discount;
        discountRules.find(item => {
            if (item.type == "category" && item.category_id == productSelection[product_id].bc_category_id){
                productSelection[product_id]['group_discount'] = {};
                productSelection[product_id]['group_discount']['method'] = item.type;
                productSelection[product_id]['group_discount']['method'] = item.method;
                productSelection[product_id]['group_discount']['amount'] = item.amount;
            } else if (item.type == "product" && item.product_id == product_id){
                productSelection[product_id]['group_discount'] = {};
                productSelection[product_id]['group_discount']['type'] = item.type;
                productSelection[product_id]['group_discount']['method'] = item.method;
                productSelection[product_id]['group_discount']['amount'] = item.amount;
            }
        })
    }
}

window.initAutocomplete = initAutocomplete;

var updateCustomizeHeaders = function(){
    $.each($('.toggle-elements .active'), function(index, value){
        let element = $(value);
        if (element.hasClass('number-elements')){
            let displayText = element.text();
            element.closest('div.card').find('.sub-heading span').html(" : "+displayText);
        } else if (element.hasClass('toggle-element2')){
            let displayText = element.find('.text-center').text();
            element.closest('div.card').find('.sub-heading span').html(" : "+displayText);
        }
        else if(element.hasClass('toggle-element')){
            let displayText = element.val();
            element.closest('div.card').find('.sub-heading span').html(" : "+displayText);
        }      
    });
}

$(document).on("click", ".quote-save-and-download", function (e) {
    if($("#quote_form").valid())
    {
        window.localStorage.setItem("clickDownloadPdf", true);
    }
 });

$(document).on('change', '#install_amount', function(){
    reTotalAllProduct();
});

function reTotalAllProduct(){
    $.each(productSelection, function(index){
        updateProductPriceImage(index);
    });
}

function calculateOverAllTotal(){
    let overAllTotal = 0;
    InstallAmount = 0;

    $.each($('select.product'), function (index, value) {
        let productId = $(value).val();
        overAllTotal += parseFloat(productSelection[productId]['total_price']);

        if (productSelection[productId]['additional'] !== undefined && productSelection[productId]['additional']['install'] !== undefined){            
            InstallAmount += parseFloat(productSelection[productId]['additional']['install']['total']) * productSelection[productId]['quantity'];
        }        
    });

    var installType = $('input[name="tax_type"]:checked').val();

    if(installType == "SEPARATE_LINE"){
        if(parseFloat(InstallAmount) > 0 || !isNaN(parseFloat(InstallAmount))){
            overAllTotal += parseFloat(InstallAmount);
        } else {
            overAllTotal += 0;
        }
    } else {
        InstallAmount = 0;
    }

    Total = overAllTotal;

    $('.installTotal').html(formatter.format(parseFloat(InstallAmount).toFixed(2)));
    $('.overallTotal').html(formatter.format(parseFloat(overAllTotal).toFixed(2)));
}
