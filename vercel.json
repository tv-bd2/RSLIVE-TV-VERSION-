{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "frame-ancestors 'self';"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/(.*)",
      "has": [
        {
          "type": "header",
          "key": "user-agent",
          "value": "(?i).*(solo|solobrowser|appcreator24).*"
        }
      ],
      "statusCode": 403,
      "destination": "/403-blocked"
    }
  ]
}
