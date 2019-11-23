$(document).ready(function() {
    // change cursor when making AJAX calls
    $(document).ajaxStart(function() {
        $("body").addClass("waiting");
    }).ajaxComplete(function() {
        $("body").removeClass("waiting");
    });
})

function activate(device, status) {
    // click one of the on/off buttons and make an AJAX call
    $.get(status + "?device=" + device, function(data, status) {
        // when the AJAX returns update the statuses
        var json = jQuery.parseJSON(data)
        $.each(json, function(i, value) {
            $("#" + value.device + " td.status").html(value.status)
        });
    });
}
