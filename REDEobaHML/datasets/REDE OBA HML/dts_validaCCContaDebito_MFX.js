function defineStructure() {

}
function onSync(lastSyncDate) {

}
function createDataset(fields, constraints, sortFields) {
    log.info("====> DTS CONTA DEBITO CC <===")
    var newDataset = DatasetBuilder.newDataset();
    var jdbc = getJDBC('c5')
    var dataSource = "/jdbc/"+jdbc;
    var ic = new javax.naming.InitialContext();
    var ds = ic.lookup(dataSource);
    var created = false; 
    var qWhere = " WHERE 1 = 1 "

    if(constraints){
        for(var i = 0; i < constraints.length; i++){
            if(constraints[i].fieldName == 'CONTA_DEBITO'){
                qWhere += " AND CONTA = '"+constraints[i].initialValue+"' " 
            }
            else if(constraints[i].fieldName == 'EMPRESA'){
                qWhere += " AND NROEMPRESA = '"+constraints[i].initialValue+"' " 
            }
        }
    }

    var myQuery = "SELECT TEMCENTROCUSTO FROM consinco.Ct_Planoconta "+qWhere
    log.info('QUERY = '+myQuery)

    try {
        var conn = ds.getConnection();
        var stmt = conn.createStatement();
        var rs = stmt.executeQuery(myQuery);
        var columnCount = rs.getMetaData().getColumnCount();
        while (rs.next()) {
            if (!created) {
                for (var i = 1; i <= columnCount; i++) {
                    newDataset.addColumn(rs.getMetaData().getColumnName(i));
                }
                created = true;
            }
            var Arr = new Array();
            for (var i = 1; i <= columnCount; i++) {
                var obj = rs.getObject(rs.getMetaData().getColumnName(i));
                if (null != obj) {
                    Arr[i - 1] = rs.getObject(rs.getMetaData().getColumnName(i)).toString();
                } else {
                    Arr[i - 1] = "null";
                }
            }
            newDataset.addRow(Arr);
        }
    } catch (e) {
        log.error("ERRO==============> " + e.message);
    } finally {
        if (rs != null) {
            rs.close();
        }
        if (stmt != null) {
            stmt.close();
        }
        if (conn != null) {
            conn.close();
        }
    }
    return newDataset;
}

function getJDBC(banco){
    var dts = DatasetFactory.getDataset('dtsConnectorJDBC', [banco], null, null)
    if(dts.values.length > 0){
        return dts.getValue(0,'JDBC')
    }else {
        throw('JDBC INCORRETO!')
    }
}

function onMobileSync(user) {

}