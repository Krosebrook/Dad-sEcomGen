import React, { useState } from 'react';
import { ProductPlan, ShopifyIntegration } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';

interface ShopifyIntegrationCardProps {
    productPlan: ProductPlan;
    logoImageUrl: string | null;
    storefrontMockupUrl: string | null;
    integrationConfig: ShopifyIntegration | null;
    setIntegrationConfig: React.Dispatch<React.SetStateAction<ShopifyIntegration | null>>;
    onPlanModified: () => void;
}

const ShopifyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-green-600"><path d="M19.125 7.125c-1.031 0-1.875.844-1.875 1.875s.844 1.875 1.875 1.875c1.031 0 1.875-.844 1.875-1.875s-.844-1.875-1.875-1.875m-14.25 0c-1.031 0-1.875.844-1.875 1.875s.844 1.875 1.875 1.875c1.031 0 1.875-.844 1.875-1.875S5.906 7.125 4.875 7.125m11.531 3c-.938 0-1.688.75-1.688 1.688s.75 1.688 1.688 1.688c.938 0 1.688-.75 1.688-1.688s-.75-1.688-1.688-1.688m-8.813 0c-.938 0-1.688.75-1.688 1.688s.75 1.688 1.688 1.688c.938 0 1.688-.75 1.688-1.688s-.75-1.688-1.688-1.688M12 4.125c-4.406 0-8.156 3.188-9 7.313h18c-.844-4.125-4.594-7.313-9-7.313"/></svg>
);

const ShopifyIntegrationCard: React.FC<ShopifyIntegrationCardProps> = ({
    productPlan,
    logoImageUrl,
    storefrontMockupUrl,
    integrationConfig,
    setIntegrationConfig,
    onPlanModified
}) => {
    const [storeUrl, setStoreUrl] = useState(integrationConfig?.storeUrl || '');
    const [apiToken, setApiToken] = useState(integrationConfig?.apiToken || '');
    const [isEditing, setIsEditing] = useState(!integrationConfig?.storeUrl);
    const [isPushing, setIsPushing] = useState(false);
    const [pushError, setPushError] = useState<string | null>(null);

    const handleSaveConfig = () => {
        const newConfig: ShopifyIntegration = {
            storeUrl,
            apiToken,
            lastPushStatus: null,
            lastPushDate: null,
            lastPushedProductId: null,
        };
        setIntegrationConfig(newConfig);
        onPlanModified();
        setIsEditing(false);
    };
    
    const handlePushToShopify = async () => {
        setIsPushing(true);
        setPushError(null);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Simulate success/failure
        const isSuccess = Math.random() > 0.2; // 80% success rate
        
        if (isSuccess) {
            const newConfig: ShopifyIntegration = {
                ...(integrationConfig!),
                lastPushStatus: 'success',
                lastPushDate: new Date().toISOString(),
                lastPushedProductId: `gid://shopify/Product/${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
            };
            setIntegrationConfig(newConfig);
            onPlanModified();
        } else {
             const newConfig: ShopifyIntegration = {
                ...(integrationConfig!),
                lastPushStatus: 'failed',
                lastPushDate: new Date().toISOString(),
            };
            setIntegrationConfig(newConfig);
            setPushError("Failed to push product. Please check your Shopify credentials and permissions.");
            onPlanModified();
        }

        setIsPushing(false);
    };

    const isConfigured = integrationConfig?.storeUrl && integrationConfig?.apiToken;
    const canPush = isConfigured && productPlan && logoImageUrl;

    const renderContent = () => {
        if (isEditing || !isConfigured) {
            return (
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="shopify-url">Shopify Store URL</Label>
                        <Input
                            id="shopify-url"
                            type="text"
                            placeholder="your-store.myshopify.com"
                            value={storeUrl}
                            onChange={(e) => setStoreUrl(e.target.value)}
                            className="h-10"
                        />
                    </div>
                    <div>
                        <Label htmlFor="shopify-token">Admin API Access Token</Label>
                        <Input
                            id="shopify-token"
                            type="password"
                            placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                            value={apiToken}
                            onChange={(e) => setApiToken(e.target.value)}
                            className="h-10"
                        />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        To get an access token, create a custom app in your Shopify Admin settings with `write_products` permissions. {' '}
                        <a href="https://help.shopify.com/en/manual/apps/custom-apps" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Learn more</a>.
                    </p>
                    <div className="flex gap-2">
                        <Button onClick={handleSaveConfig} disabled={!storeUrl || !apiToken}>Save Configuration</Button>
                        {isConfigured && <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>}
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                 <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Store URL</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{integrationConfig.storeUrl}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Edit</Button>
                    </div>
                 </div>
                 {integrationConfig.lastPushStatus && (
                     <div className={`p-3 rounded-lg text-sm font-medium ${integrationConfig.lastPushStatus === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                        {integrationConfig.lastPushStatus === 'success' ?
                            `Successfully pushed product on ${new Date(integrationConfig.lastPushDate!).toLocaleString()}.` :
                            `Last push attempt failed on ${new Date(integrationConfig.lastPushDate!).toLocaleString()}.`
                        }
                        {integrationConfig.lastPushStatus === 'success' && integrationConfig.lastPushedProductId &&
                            <a 
                                href={`https://${integrationConfig.storeUrl}/admin/products/${integrationConfig.lastPushedProductId.split('/').pop()}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="ml-2 font-bold underline"
                            >
                                View in Shopify
                            </a>
                        }
                     </div>
                 )}
                 {pushError && <p className="text-sm text-red-500">{pushError}</p>}
                 <Button onClick={handlePushToShopify} disabled={!canPush || isPushing} className="w-full">
                     {isPushing ? (
                         <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Pushing to Shopify...
                         </>
                     ) : (
                         `Push "${productPlan.productTitle}" to Shopify`
                     )}
                 </Button>
                 {!canPush && <p className="text-xs text-center text-slate-500 dark:text-slate-400">You must have a product plan and a generated logo to push to Shopify.</p>}
                 <p className="text-xs text-center text-slate-500 dark:text-slate-400">This will create a new product draft, including the description, price, variants, logo, and mockup image.</p>
            </div>
        );
    };

    return (
        <Card className="w-full animate-fade-in text-left">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <ShopifyIcon />
                    <div>
                        <CardTitle className="text-2xl md:text-3xl">Shopify Integration</CardTitle>
                        <CardDescription>Push your product directly to your Shopify store as a draft.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    );
};

export default ShopifyIntegrationCard;
