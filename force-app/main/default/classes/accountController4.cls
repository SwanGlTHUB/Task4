public with sharing class accountController4 {
    
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts() {
        List<Account> accounts;
        accounts = [
            SELECT Name, Rating
            FROM Account
            LIMIT 100
        ];
        
        return accounts;
    }
}
