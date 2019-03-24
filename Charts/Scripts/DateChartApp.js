
function ChartBuilder() {

    var self = this;
    this.subInvoices = [];
    this.invoices = [];
    this.requestCounter = 0;

    this.retrieveListItems = function () {
        var hostweburl = decodeURIComponent(this.getQueryStringParameter("SPHostUrl"));

        this.requestCounter = 0;
        this.getSList(hostweburl);
        this.getIList(hostweburl);
    };

    this.getSList = function (url) {

        var clientContext = SP.ClientContext.get_current();
        var parentCtx = new SP.AppContextSite(clientContext, url);

        var sList = parentCtx.get_web().get_lists().getByTitle('Sub Invoices');

        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml("<View>" +
                                "<ViewFields>" +
                                    "<FieldRef Name='Invoice' />" +
                                    "<FieldRef Name='Units' />" +
                                    "<FieldRef Name='PerUnit' />" +
                                "</ViewFields>" +
                            "</View>");

        sCollListItem = sList.getItems(camlQuery);
        clientContext.load(sCollListItem);
        clientContext.executeQueryAsync(this.onsQuerySucceeded, this.onQueryFailed);
    };

    this.getIList = function (url) {

        var clientContext = SP.ClientContext.get_current();
        var parentCtx = new SP.AppContextSite(clientContext, url);

        var sList = parentCtx.get_web().get_lists().getByTitle('Invoice');

        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml("<View>" +
                                "<ViewFields>" +
                                    "<FieldRef Name='Vender' />" +
                                    "<FieldRef Name='InvoiceDate' />" +
                                "</ViewFields>" +
                                "<OrderBy>" +
                                "<FieldRef Name='InvoiceDate' Ascending='FALSE' />" +
                                "</OrderBy></View>");

        iCollListItem = sList.getItems(camlQuery);
        clientContext.load(iCollListItem);
        clientContext.executeQueryAsync(this.onIQuerySucceeded, this.onQueryFailed);
    };

    this.onsQuerySucceeded = function (sender, args) {
        var listItemEnumerator = sCollListItem.getEnumerator();
        self.requestCounter++;
        while (listItemEnumerator.moveNext()) {
            var sListItem = listItemEnumerator.get_current();
            self.subInvoices.push(
                {
                    Id: sListItem.get_id(),
                    Invoice: sListItem.get_item("Invoice"),
                    Units: sListItem.get_item("Units"),
                    PerUnit: sListItem.get_item("PerUnit"),
                    Sum: sListItem.get_item("Units") * sListItem.get_item("PerUnit")
                });
        }

        if (self.requestCounter == 2) self.joinLinks()
    };

    this.onIQuerySucceeded = function (sender, args) {
        var listItemEnumerator = iCollListItem.getEnumerator();
        self.requestCounter++;
        while (listItemEnumerator.moveNext()) {
            var iListItem = listItemEnumerator.get_current();
            self.invoices.push({
                Id: iListItem.get_id(),
                Vender: iListItem.get_item("Vender"),
                Date: iListItem.get_item("InvoiceDate")
            });
        }

        if (self.requestCounter == 2) self.joinLinks()
    };

    this.joinLinks = function () {
        var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var items = [];
        var sums = [];
        var index = 0;
        for (var n = 0; n < self.invoices.length; n++) {
            var date = self.invoices[n].Date;
            var dateString = monthNames[date.getMonth()] + ' ' + date.getFullYear();
            var key = self.invoices[n].Id;
            for (var m = 0; m < self.subInvoices.length; m++) {
                if (self.subInvoices[m].Invoice.get_lookupId() == key) {
                    var id = items.indexOf(dateString)
                    if (id == -1) {
                        items.push(dateString);
                        sums.push(0);
                        sums[index] += self.subInvoices[m].Sum;
                        index++;
                    }
                    else {
                        sums[id] += self.subInvoices[m].Sum;
                    }
                }
            }
        }

        self.render(items, sums);
    }

    this.onQueryFailed = function (err) {
        console.log(err);
    };

    this.render = function (items, sums) {
        console.log(items);
        console.log(sums);

        var colors = [];
        for (var c = 0; c < items.length; c++) {
            var color = self.getRandomColor();
            colors.push(color);
        }

        var ctx = document.getElementById("venderChart");

        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: items,
                datasets: [{
                    label: 'Venders',
                    data: sums,
                    borderWidth: 1,
                    backgroundColor: colors,
                }]
            },
            options: {
                legend: {
                    display: false
                },
                tooltips: {
                    callbacks: {
                        label: function (item, data) {
                            var sum = data.datasets[item.datasetIndex].data[item.index];
                            var title = data.labels[item.index]
                            return title + ': ' + self.formatDollar(sum);
                        },
                        title: function () { return ''; }
                    }
                }
            }
        });
    };

    this.getRandomColor = function () {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    this.getQueryStringParameter = function (paramToRetrieve) {
        var params =
            document.URL.split("?")[1].split("&");
        var strParams = "";
        for (var i = 0; i < params.length; i = i + 1) {
            var singleParam = params[i].split("=");
            if (singleParam[0] == paramToRetrieve)
                return singleParam[1];
        }
    }

    this.formatDollar = function (num) {
        var p = num.toString();
        return "$" + p.split("").reverse().reduce(function (acc, num, i, orig) {
            return num + (i && !(i % 3) ? "." : "") + acc;
        }, "");
    }
}

function init() {
    var chartBuilder = new ChartBuilder();
    chartBuilder.retrieveListItems();
}

jQuery(document).ready(function ($) {
    ExecuteOrDelayUntilScriptLoaded(function () { init(); }, "sp.js");
});
