import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
    const cookieLocale = (await cookies()).get("SALES_CLOSE_MANAGE_LOCALE")?.value;
    
    // Default to French if no cookie is found, otherwise use the cookie value
    const locale = cookieLocale || "fr";

    return {
        locale,
        messages: (await import(`./config/language/${locale}.json`)).default
    };
}); 