from pytezos import *
from time import sleep
import requests
from hashlib import blake2b
import argparse
import json
from os import urandom

parser = argparse.ArgumentParser()
parser.add_argument('-p', '--private-key', help="Admin's private key")
parser.add_argument('-a', '--api-key', help="Kaiko api key")
args = parser.parse_args()

# admin setup to be able to execute transactions
admin = pytezos.using(shell='https://rpc.mainnet.tzstats.com',
                      key=args.private_key)

contract = admin.contract("KT192nuuX8TLqsBK8XQo5e5uB2GLjLwNkoNy") # set the contract
salt = urandom(5)   # generate the salt
tx3 = admin.bulk(contract.save_hashed_salt(blake2b(salt).digest())).autofill().sign().inject(_async=False)  # save the hashed salt for the first round
print(tx3)

while True:
    try:    # try catch if the rpc node is down
        if int(contract.storage['id']()) == 500:
            try:
                res = requests.get(
                    url="https://us.market-api.kaiko.io/v2/data/trades.v1/spot_direct_exchange_rate/xtz/usd?include_exchanges=*&sources=true",
                    headers={
                        "X-Api-Key": args.api_key
                    }).json()   # get the api data from KAIKO
                res['timestamp'] /= 1000    #convert it to seconds
                vol, timestamp = int(float(res['data'][0]['volume']) * 10 ** 8).to_bytes(byteorder="big", length=10), int(
                    res['timestamp']).to_bytes(length=10, byteorder="big")  # conver the data to bytes
                winner = int(blake2b(salt + timestamp + vol).hexdigest(), 16)   # concatenate + hash the data + convertion to int
                tx = admin.bulk(contract.selectWinner(winner)).autofill().sign().inject(_async=False)   # select the winner
                tx["salt"] = int.from_bytes(salt, byteorder="big")  # convert salt to int
                with open("../history/winner_history.json", "a") as f:  # save the winner selection transaction
                    json.dump(tx, f)
                    f.close()
                winner_data = {
                                'time': timestamp,
                                'volume': vol,
                                'salt': salt
                            }
                sleep(180)
                tx2 = admin.bulk(contract.save_data(winner_data)).autofill().sign().inject(_async=False)    # save the winning data
                sleep(180)
                salt = urandom(5)   # computes the new salt
                tx3 = admin.bulk(contract.save_hashed_salt(blake2b(salt).digest())).autofill().sign().inject(_async=False)  # saves the hashed salt to the contract
                sleep(240)
            except Exception as e:
                print(str(e))
    except Exception as e:
        print(str(e))
    sleep(1)
