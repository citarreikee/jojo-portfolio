#!/usr/bin/env python3
import hashlib
import hmac
import json
import os
import subprocess
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


SECRET = os.environ["GITHUB_WEBHOOK_SECRET"].encode()
EXPECTED_REPOSITORY = os.environ.get(
    "GITHUB_WEBHOOK_REPOSITORY", "citarreikee/jojo-portfolio"
)
MAX_BODY_SIZE = 1024 * 1024


class WebhookHandler(BaseHTTPRequestHandler):
    server_version = "JojoWebhook/1.0"

    def log_message(self, message: str, *args: object) -> None:
        print(f"{self.address_string()} - {message % args}", flush=True)

    def respond(self, status: int, message: str) -> None:
        body = f"{message}\n".encode()
        self.send_response(status)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self) -> None:
        if self.path != "/github":
            self.respond(404, "not found")
            return

        try:
            body_size = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.respond(400, "invalid content length")
            return

        if body_size <= 0 or body_size > MAX_BODY_SIZE:
            self.respond(413, "invalid payload size")
            return

        body = self.rfile.read(body_size)
        expected = "sha256=" + hmac.new(SECRET, body, hashlib.sha256).hexdigest()
        supplied = self.headers.get("X-Hub-Signature-256", "")
        if not hmac.compare_digest(expected, supplied):
            self.respond(401, "invalid signature")
            return

        event = self.headers.get("X-GitHub-Event", "")
        if event == "ping":
            self.respond(200, "pong")
            return

        if event != "push":
            self.respond(202, "event ignored")
            return

        try:
            payload = json.loads(body)
        except json.JSONDecodeError:
            self.respond(400, "invalid json")
            return

        if payload.get("ref") != "refs/heads/main":
            self.respond(202, "branch ignored")
            return

        if payload.get("repository", {}).get("full_name") != EXPECTED_REPOSITORY:
            self.respond(403, "repository rejected")
            return

        try:
            subprocess.run(
                ["systemctl", "start", "--no-block", "jojo-update.service"],
                check=True,
            )
        except subprocess.CalledProcessError:
            self.respond(500, "failed to queue deployment")
            return

        self.respond(202, "deployment queued")


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 9187), WebhookHandler)
    server.serve_forever()
