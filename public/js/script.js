$(document).ready(function () {
    $("#invoiceDate").datepicker();

    $("#qty, #amount, #tax").on("input change", function () {
        calculateAmounts();
    });

    function calculateAmounts() {
        let qty = parseFloat($("#qty").val()) || 0;
        let amount = parseFloat($("#amount").val()) || 0;
        let taxPercentage = parseFloat($("#tax").val()) || 0;

        let totalAmount = qty * amount;
        $("#total").val(totalAmount);

        let taxAmount = (totalAmount * taxPercentage) / 100;
        $("#taxAmount").val(taxAmount);

        let netAmount = totalAmount + taxAmount;
        $("#netAmount").val(netAmount);
    }

    $("#invoiceForm").on("submit", function (e) {
        let file = $("#file")[0].files[0];
        if (file.size > 3 * 1024 * 1024) {
            alert("File size must be less than 3 MB");
            e.preventDefault();
        }
    });

    function loadInvoices() {
        $.get("/invoice/all", function (data) {
            let rows = '';
            data.forEach(function (invoice) {
                rows += `
                    <tr>
                        <td>${invoice.id}</td>
                        <td>${invoice.qty}</td>
                        <td>${invoice.amount}</td>
                        <td>${invoice.total}</td>
                        <td>${invoice.tax}</td>
                        <td>${invoice.taxAmount}</td>
                        <td>${invoice.netAmount}</td>
                        <td>${invoice.customerName}</td>
                        <td>${invoice.invoiceDate}</td>
                        <td><a href="${invoice.file}">Download</a></td>
                        <td>${invoice.customerEmail}</td>
                        <td>
                            <button class="edit" data-id="${invoice.id}">Edit</button>
                            <button class="delete" data-id="${invoice.id}">Delete</button>
                        </td>
                    </tr>`;
            });
            $("#invoiceTable tbody").html(rows);
        });
    }

    loadInvoices();

    $("#invoiceTable").on("click", ".edit", function () {
        let id = $(this).data("id");
        $.get(`/invoice/${id}`, function (data) {
            $("#invoiceId").val(data.id);
            $("#qty").val(data.qty);
            $("#amount").val(data.amount);
            $("#tax").val(data.tax);
            $("#customerName").val(data.customerName);
            $("#invoiceDate").val(data.invoiceDate);
            $("#customerEmail").val(data.customerEmail);
            calculateAmounts();
        });
    });

    $("#invoiceTable").on("click", ".delete", function () {
        let id = $(this).data("id");
        $.ajax({
            url: `/invoice/${id}`,
            type: 'DELETE',
            success: function () {
                loadInvoices();
            }
        });
    });
});
