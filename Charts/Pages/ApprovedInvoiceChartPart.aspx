<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<WebPartPages:AllowFraming ID="AllowFraming1" runat="server" />
<script type="text/javascript" src="../Scripts/jquery-1.9.1.min.js"></script>
<script type="text/javascript" src="_layouts/15/init.js"></script>
<script type="text/javascript" src="_layouts/15/MicrosoftAjax.js"></script>
<script type="text/javascript" src="_layouts/15/SP.Core.js"></script>
<script type="text/javascript" src="_layouts/15/sp.runtime.js"></script>
<script type="text/javascript" src="_layouts/15/sp.js"></script>
<script type="text/javascript" src="../Scripts/Chart.min.js"></script>
<script type="text/javascript" src="../Scripts/ChartPartApproved.js"></script>
<div>
    <div style="float: left">
        <canvas id="venderChart" width="300" height="300"></canvas>
    </div>
    <div style="float: left" id="legend">
    </div>
</div>