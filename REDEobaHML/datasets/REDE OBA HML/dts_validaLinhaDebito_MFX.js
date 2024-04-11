function defineStructure() {

}
function onSync(lastSyncDate) {

}
function createDataset(fields, constraints, sortFields) {
    log.info("====> DTS GETNATUREZA <===")
    var newDataset = DatasetBuilder.newDataset();
    var jdbc = getJDBC('c5')
    var dataSource = "/jdbc/"+jdbc;
    var ic = new javax.naming.InitialContext();
    var ds = ic.lookup(dataSource);
    var created = false; 
    var whereEmpresa = " (CT_PLANILHALINHA.NROEMPRESA = '99' OR CT_PLANILHALINHA.NROEMPRESA = '901') "
    var whereNat = '' 
    var whereCodCusto = ''
    var whereLimit = ''
    if(constraints){
        for(var i = 0; i < constraints.length; i++){
            if(constraints[i].fieldName == 'CODFILIAL'){
                whereEmpresa = "CT_PLANILHALINHA.NROEMPRESA = '"+constraints[i].initialValue+"' " 
            }
            else if(constraints[i].fieldName == 'CODNAT'){
                whereNat = "And	CT_PLANILHALINHA.NROPLANILHA = '"+constraints[i].initialValue+"' " 
            }
            else if(constraints[i].fieldName == 'CODCUSTO'){
                whereCodCusto = "AND CT_PLANILHALINHA.CENTROCUSTODB = '"+constraints[i].initialValue +"' "
            }
        }
    }else{
        whereLimit = 'AND rownum <= 10 '
    }

    
    var myQuery = "select CT_PLANILHALINHA.NROLINHA, CT_PLANILHALINHA.FILIAL, CT_PLANILHALINHA.NROPLANILHA, CT_PLANILHALINHA.NROEMPRESA, NVL(PD.TEMENTIDADE,'N'), NVL(PD.TEMCENTROCUSTO,'N'), NVL(PC.TEMENTIDADE,'N'), NVL(PC.TEMCENTROCUSTO,'N'), CT_PLANILHALINHA.CONTADEBITO, PD.DESCRICAO, CT_PLANILHALINHA.TIPOENTIDADEDB, CT_PLANILHALINHA.CODENTIDADEDB, CT_PLANILHALINHA.CENTROCUSTODB, CT_PLANILHALINHA.CONTACREDITO, PC.DESCRICAO, CT_PLANILHALINHA.TIPOENTIDADECR, CT_PLANILHALINHA.CODENTIDADECR, CT_PLANILHALINHA.CENTROCUSTOCR, CT_PLANILHALINHA.HISTORICO, CT_PLANILHALINHA.CONTABSPED, CT_PLANILHALINHA.INDTIPOCONTASPED "+                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
    "from consinco.CT_PLANILHALINHA, consinco.CTV_PLANOCONTADESKTOP PC, consinco.CTV_PLANOCONTADESKTOP PD Where "+
            whereEmpresa +         
            whereNat+
    "AND 	CT_PLANILHALINHA.NROEMPRESA = PC.NROEMPRESA(+) "+ 
    "AND 	CT_PLANILHALINHA.NROEMPRESA = PD.NROEMPRESA(+) "+
    "AND	CT_PLANILHALINHA.CONTADEBITO = PD.CONTA(+) "+
    "AND	CT_PLANILHALINHA.CONTACREDITO = PC.CONTA(+) "+
            whereCodCusto+
            whereLimit+
     "Order By NROPLANILHA, NROLINHA "

    log.info('queyyy '+myQuery)
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
}function getJDBC(banco){
    var dts = DatasetFactory.getDataset('dtsConnectorJDBC', [banco], null, null)
    if(dts.values.length > 0){
        return dts.getValue(0,'JDBC')
    }else {
        throw('JDBC INCORRETO!')
    }
}function onMobileSync(user) {

}