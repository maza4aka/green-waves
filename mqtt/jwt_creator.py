from jwt import encode

import datetime

def create_jwt(project_id, private_key_file, algorithm):
    with open(private_key_file, 'r') as f:
        return encode({
            'iat': datetime.datetime.utcnow(),
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
            'aud': project_id
        }, f.read(), algorithm=algorithm)

result = create_jwt("green-wave-dummy", "../rsa_private.pem", "RS256")
print(result.decode("utf-8"), end='')

