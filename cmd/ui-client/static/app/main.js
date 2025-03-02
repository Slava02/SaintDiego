// main.js
class App {
    static clientToken = null;
    static keycloakInstance = null;

    static init() {
        this.keycloakInstance = new Keycloak({
            url: keycloakEndpoint,
            realm: keycloakRealm,
            clientId: keycloakClientId
        });

        this.keycloakInstance.init({
            onLoad: 'login-required',
            pkceMethod: 'S256'
        }).then(authenticated => {
            document.getElementById('loading').classList.add('hidden');

            if (!authenticated) {
                throw new Error('Not authenticated!');
            }

            if (!this.keycloakInstance.hasResourceRole(keycloakClientRole, keycloakClientId)) {
                throw new Error('RBAC: No required role for this user');
            }

            this.clientToken = this.keycloakInstance.token;
            console.info('Keycloak token:', this.clientToken);

            // Show authenticated UI
            document.getElementById('authSection').classList.remove('hidden');
            document.getElementById('sendBtn').addEventListener('click', () => this.sendTestRequest());
        }).catch(error => {
            console.error('Keycloak error:', error);
            alert('Authentication error: ' + error.message);
        });
    }

    static async sendTestRequest() {
        try {
            const input = document.getElementById('inputData').value;
            const url = `${backendBaseUrl}/testHandler`; // Используем полный URL
            const requestId = crypto.randomUUID();

            console.log("Sending request to:", url);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${App.clientToken}`,
                    'X-Request-ID': requestId
                },
                body: JSON.stringify({ greeting: input })
            });

            console.log("Received response status:", response.status);

            const responseText = await response.text();
            console.log("Raw response text:", responseText);

            try {
                const data = JSON.parse(responseText);
                document.getElementById('response').textContent =
                    `Response: ${JSON.stringify(data, null, 2)}`;
            } catch (e) {
                throw new Error(`Invalid JSON. Raw response: ${responseText}`);
            }

        } catch (error) {
            console.error('Full error:', error);
            document.getElementById('response').textContent =
                `Error: ${error.message}`;
        }
    }
}
