
function DepChartBuilder() {

    var self = this;
    this.subInvoices = [];
    this.invoices = [];

    this.retrieveListItems = function () {
        var hostweburl = decodeURIComponent(this.getQueryStringParameter("SPHostUrl"));
        this.getSList(hostweburl);
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
                                    "<FieldRef Name='Department' />" +
                                "</ViewFields>" +
                            "</View>");

        sCollListItem = sList.getItems(camlQuery);
        clientContext.load(sCollListItem);
        clientContext.executeQueryAsync(this.onsQuerySucceeded, this.onQueryFailed);
    };

    this.onsQuerySucceeded = function (sender, args) {
        var listItemEnumerator = sCollListItem.getEnumerator();
        while (listItemEnumerator.moveNext()) {
            var sListItem = listItemEnumerator.get_current();
            self.subInvoices.push(
                {
                    Id: sListItem.get_id(),
                    Invoice: sListItem.get_item("Invoice"),
                    Units: sListItem.get_item("Units"),
                    PerUnit: sListItem.get_item("PerUnit"),
                    Department: sListItem.get_item("Department"),
                    Sum: sListItem.get_item("Units") * sListItem.get_item("PerUnit")
                });
        }
        self.joinLinks();
    };

    this.joinLinks = function () {
        var items = [];
        var sums = [];
        var index = -1;
        for (var m = 0; m < self.subInvoices.length; m++) {
            var dep = self.subInvoices[m].Department;
            if (items.indexOf(dep) == -1) {
                items.push(dep);
                sums.push(0);
                index++;
            }

            if (self.subInvoices[m].Department == dep) {
                sums[index] += self.subInvoices[m].Sum;
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

        var legend = "<ul style='list-style: none;'>";

        var colors = [];
        for (var c = 0; c < items.length; c++) {
            var color = self.getRandomColor();
            colors.push(color);
            legend += "<li><span style='margin: 5px;background:" + color + "'>&nbsp;&nbsp;&nbsp;</span><span>"
                + items[c] + "</span><span>&nbsp;&nbsp;</span><span>" + this.formatDollar(sums[c]) + "</span></li>";
        }

        legend += '</ul>';
        document.getElementById('legend').innerHTML = legend;

        var ctx = document.getElementById("venderChart");

        var myChart = new Chart(ctx, {
            type: 'pie',
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

                            if (title.length > 15) {
                                var ts = title.split(' ');
                                ts.push(self.formatDollar(sum));
                                return ts;
                            }

                            return title + ': ' + self.formatDollar(sum);
                        }
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

function initdep() {
    var depChartBuilder = new DepChartBuilder();
    depChartBuilder.retrieveListItems();
}

jQuery(document).ready(function ($) {
    ExecuteOrDelayUntilScriptLoaded(function () { initdep(); }, "sp.js");
});
