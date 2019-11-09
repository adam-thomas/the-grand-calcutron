function showAddInner(children_element, main_row_element) {
    main_row_element.children(".show-add-form").addClass("show");
    main_row_element.children(".delete-task").addClass("show");
    children_element.addClass("show");
}


function toggleChildren(button_element, task_id) {
    children_element = $("#children-of-" + task_id);
    main_row_element = $(button_element).parent();

    if (children_element.hasClass("show")) {
        children_element.removeClass("show");
        children_element.children(".task-form-wrapper").removeClass("show");
        main_row_element.children(".show-add-form").removeClass("show");
        main_row_element.children(".delete-task").removeClass("show");
        $(button_element).html("v");
    } else {
        showAddInner(children_element, main_row_element);
        $(button_element).html("^");
    }
}


function showAddForm(task_id) {
    form_wrapper_element = $("#add-form-of-" + task_id);
    form_wrapper_element.addClass("show");
    title_input_element = form_wrapper_element.find(".task-title");
    title_input_element.focus();
}


function showTab(tab_element) {
    $("nav button").removeClass("active");
    $(tab_element).addClass("active");

    let id = $(tab_element).attr("id");

    $(".tab-contents-container").removeClass("show");
    $(".tab-contents-container#container-of-" + id).addClass("show");
    $(".form-visibility-wrapper#add-form-of-" + id).addClass("show");

    $(".tab-options form").removeClass("show");
    $(".tab-options form#options-of-" + id).addClass("show");
}


function parseForm(form_element) {
    results = {};
    let input_elements = $(form_element).find("input");

    for (let input of input_elements) {
        results[$(input).attr("name")] = $(input).val();
    }
    return results;
}


function submitAjaxForm(event, form_element, target_url) {
    event.preventDefault();
    data = parseForm(form_element);

    $.post(target_url, data, (return_data, status) => {
        children_element = $("#children-of-" + data.parent);
        children_element.replaceWith(return_data);

        showAddInner(children_element, children_element.parent().children(".main-row"));
        showAddForm(data.parent);
    });
}


$(document).ready(() => {
    // Display the first tab.
    showTab($("nav").children("button")[0]);
})
