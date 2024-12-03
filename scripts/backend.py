from flask import Flask, jsonify, request
from pymongo import MongoClient
import boto3
from botocore.exceptions import NoCredentialsError
import random
from datetime import datetime
import json
from confluent_kafka import Producer
from bson.objectid import ObjectId
from flask_cors import CORS 
import pandas as pd
import time
import smtplib
from email.mime.text import MIMEText

producer_conf = {
    'bootstrap.servers': 'localhost:9092',  
    'client.id': 'backend-producer'
}

df_usps = pd.read_csv('../public/dataset/usps_zip.csv')

producer = Producer(producer_conf)

app = Flask(__name__)
CORS(app)
client = MongoClient('mongodb://localhost:27141/')
db = client['donation-system'] 


s3_client = boto3.client(
    's3',
    aws_access_key_id='<ENTER_AWS_ACCESS_KEY_ID>',
    aws_secret_access_key='<ENTER_AWS_SECRET_ACCESS_KEY>',
    region_name='us-east-1'
)
bucket_name = 'dds-donation-images'


main_cause_map = {
    'Flood': 'Flooding and Water-Related',
    'Flash Flood': 'Flooding and Water-Related',
    'Coastal Flood': 'Flooding and Water-Related',
    'Heavy Rain': 'Flooding and Water-Related',
    'Rip Current': 'Flooding and Water-Related',
    'High Surf': 'Flooding and Water-Related',
    'Marine Hail': 'Flooding and Water-Related',
    'Marine Thunderstorm Wind': 'Flooding and Water-Related',
    'Marine Tropical Depression': 'Flooding and Water-Related',
    'Marine Tropical Storm': 'Flooding and Water-Related',
    'Waterspout': 'Flooding and Water-Related',
    'Tropical Depression': 'Flooding and Water-Related',
    'Tropical Storm': 'Flooding and Water-Related',
    'Excessive Heat': 'Heat and Drought',
    'Heat': 'Heat and Drought',
    'Drought': 'Heat and Drought',
    'Wildfire': 'Heat and Drought',
    'Debris Flow': 'Heat and Drought',
    'High Wind': 'Wind and Storm',
    'Strong Wind': 'Wind and Storm',
    'Thunderstorm Wind': 'Wind and Storm',
    'Dust Storm': 'Wind and Storm',
    'Hail': 'Wind and Storm',
    'Lightning': 'Wind and Storm',
    'Tornado': 'Wind and Storm',
    'Funnel Cloud': 'Wind and Storm',
}

@app.route('/add-donation', methods=['POST'])
def add_donation():
    usps_state = request.form.get('usps_state')
    campaign_id = int(request.form.get('campaign_id'))
    email = request.form.get('email')
    donation_categories = request.form.get('donation_categories')  # JSON string
    message = request.form.get('message')

    if donation_categories:
        donation_categories = eval(donation_categories)  # Or use json.loads

    donation_files = request.files
    donation_urls = []

    if not usps_state or not campaign_id or not email or not donation_categories:
        return jsonify({'error': 'usps_state, campaign_id, email, and donation_categories are required'}), 400

    session = client.start_session()
    session.start_transaction()

    try:
        for file_key in donation_files:
            file = donation_files[file_key]
            filename = file.filename
            try:
                s3_client.upload_fileobj(file, bucket_name, filename)
                donation_urls.append(filename)
            except FileNotFoundError:
                raise Exception(f"File not found: {filename}")
            except NoCredentialsError:
                raise Exception("AWS credentials not available")
            except Exception as e:
                raise Exception(f"Error uploading image {filename}: {str(e)}")

        donation_document = {
            "campaign_id": campaign_id,
            "email": email,
            "usps_state": usps_state,
            "image_url_list": donation_urls,
            "donation_category_list": donation_categories,
            "message": message,
        }
        donation_result = db.donations.insert_one(donation_document, session=session)
        donation_id = donation_result.inserted_id
        number_of_items = len(donation_categories)
        print(donation_id)
        
        db.campaigns.update_one(
            {"_id": campaign_id},
            {"$push": {"donations": donation_id}},
            session=session
        )
        # Send the email notification
        try:
            send_email_notification(email, usps_state, donation_categories, campaign_id, number_of_items)
            db.donations.update_one(
                {"_id": donation_id},
                {"$set": {"email_sent": True}},
                session=session
            )
        except Exception as email_error:
            print(f"Error sending email: {str(email_error)}")
            # Do not abort transaction if email fails

        session.commit_transaction()
        
        return jsonify({'message': 'Donation successfully created'}), 201

    except Exception as e:
        session.abort_transaction()

        for file_name in donation_urls:
            try:
                s3_client.delete_object(Bucket=bucket_name, Key=file_name)
            except Exception as cleanup_error:
                print(f"Error cleaning up file {file_name} from S3: {str(cleanup_error)}")

        return jsonify({'error': f'Failed to create donation: {str(e)}'}), 400

    finally:
        # End the session
        session.end_session()

def send_email_notification(email, state, categories, campaign_id, num_items):
    """
    Function to send email notification.
    """
    row = df_usps[df_usps["State"] == state]
    addr = f"""
    {row["PHYSICAL DELV ADDR"].iloc[0]} 
    {row["PHYSICAL CITY"].iloc[0]}, {row["PHYSICAL STATE"].iloc[0]}, {row["PHYSICAL ZIP"].iloc[0]}"""
    # print(addr)
    

    # Format email content
    subject = "Thank you for your donation!"
    subject = "Thank you for your donation!"
    body = f"""
    Dear Donor,

    Thank you for your generous donation to campaign ID {campaign_id}.
    Here are the details of your donation:
    - Number of items donated: {num_items}
    - Donation categories: {', '.join(categories)}

    Please drop your donations at the USPS address: 
    {addr} 

    Your contribution is greatly appreciated!

    Best Regards,
    Donation System Team
    """

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = 'ds.himanshu.work@gmail.com' 
    msg['To'] = email

    # Send the email
    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login('ds.himanshu.work@gmail.com', 'bzck qpoc leig nnpj')  
            server.sendmail('ds.himanshu.work@gmail.com', email, msg.as_string())
        print(f"Email sent to {email}")
    except Exception as e:
        print(f"Failed to send email to {email}: {e}")
        raise

# Checking Query performance without Text Index on an unsharded Application
@app.route('/search-title', methods=['GET'])
def search_title():
    start_time = time.time() 
    query = request.args.get('query', '').strip()

    if not query:
        return jsonify({'error': 'Query string is required'}), 400

    campaigns = db.campaigns.find({"title": {"$regex": query, "$options": "i"}})
    campaign_list = []

    for campaign in campaigns:
        location = db.locations.find_one({"_id": campaign["location_id"]})

        if not location:
            return jsonify({'error': 'Location not found'}), 404
        
        campaign_data = {
            "campaign_id": str(campaign["_id"]),
            "title": campaign["title"],
            "description": campaign["description"],
            "cause": campaign["cause"],
            "event_type": campaign["event_type"],
            "event_date": campaign["event_date"],
            "state": location["state"], 
            "street_name": location["street_name"], 
            "image_url": campaign["image_url"],
            "donations": [str(donation_id) for donation_id in campaign.get("donations", [])],
        }
        campaign_list.append(campaign_data)
        print(campaign_list)
    end_time = time.time()  # End the timer
    elapsed_time = end_time - start_time  # Calculate elapsed time
    
    print(f"Time taken: {elapsed_time:.2f} seconds")  # Log the elapsed time
    return jsonify(campaign_list), 200

@app.route('/campaigns/search', methods=['GET'])
def search_campaigns():
    start_time = time.time() 
    query = request.args.get('query', '').strip()

    if not query:
        return jsonify({'error': 'Query string is required'}), 400

    campaigns = db.campaigns.find({ "$text": { "$search": query }})
    campaign_list = []

    for campaign in campaigns:
        location = db.locations.find_one({"_id": campaign["location_id"]})

        if not location:
            return jsonify({'error': 'Location not found'}), 404
        
        campaign_data = {
            "campaign_id": str(campaign["_id"]),
            "title": campaign["title"],
            "description": campaign["description"],
            "cause": campaign["cause"],
            "event_type": campaign["event_type"],
            "event_date": campaign["event_date"],
            "state": location["state"], 
            "street_name": location["street_name"], 
            "image_url": campaign["image_url"],
            "donations": [str(donation_id) for donation_id in campaign.get("donations", [])],
        }
        campaign_list.append(campaign_data)
        print(campaign_list)
    end_time = time.time()  # End the timer
    elapsed_time = end_time - start_time  # Calculate elapsed time
    
    print(f"Time taken: {elapsed_time:.2f} seconds")  # Log the elapsed time
    return jsonify(campaign_list), 200

@app.route('/campaigns', methods=['GET'])
def get_all_campaigns():
    start_time = time.time() 
    campaigns = db.campaigns.find({}).limit(50)
    campaign_list = []

    for campaign in campaigns:
        location = db.locations.find_one({"_id": campaign["location_id"]})

        if not location:
            return jsonify({'error': 'Location not found'}), 404
        
        campaign_data = {
            "campaign_id": str(campaign["_id"]),
            "title": campaign["title"],
            "description": campaign["description"],
            "cause": campaign["cause"],
            "event_type": campaign["event_type"],
            "event_date": campaign["event_date"],
            "state": location["state"], 
            "street_name": location["street_name"], 
            "image_url": campaign["image_url"],
            "donations":[str(donation_id) for donation_id in campaign.get("donations", [])] ,
        }
        campaign_list.append(campaign_data)
    end_time = time.time()  # End the timer
    elapsed_time = end_time - start_time  # Calculate elapsed time
    
    print(f"Time taken: {elapsed_time:.2f} seconds")  # Log the elapsed time
    return jsonify(campaign_list), 200


@app.route('/campaigns/causes/<cause>', methods=['GET'])
def get_campaigns_by_cause(cause):
    start_time = time.time() 
    main_cause = main_cause_map.get(cause)
    campaigns = db.campaigns.find({"cause": main_cause, "event_type":cause})
    campaign_list = []

    for campaign in campaigns:
        location = db.locations.find_one({"_id": campaign["location_id"]})

        if not location:
            return jsonify({'error': 'Location not found'}), 404
        
        campaign_data = {
            "campaign_id": str(campaign["_id"]),
            "title": campaign["title"],
            "description": campaign["description"],
            "cause": campaign["cause"],
            "event_type": campaign["event_type"],
            "event_date": campaign["event_date"],
            "state": location["state"], 
            "street_name": location["street_name"], 
            "image_url": campaign["image_url"],
            "donations":[str(donation_id) for donation_id in campaign.get("donations", [])],
        }
        campaign_list.append(campaign_data)
    end_time = time.time()  # End the timer
    elapsed_time = end_time - start_time  # Calculate elapsed time
    
    print(f"Time taken: {elapsed_time:.2f} seconds")  # Log the elapsed time
    print(f"Returning {len(campaign_list)} records")
    return jsonify(campaign_list), 200

@app.route('/campaigns/<campaign_id>', methods=['GET'])
def get_campaign_by_id(campaign_id):
    start_time = time.time() 
    campaign = db.campaigns.find_one({"_id":int(campaign_id)})
    if not campaign:
        return jsonify({'error': 'Campaign not found'}), 404
    
    location = db.locations.find_one({"_id": campaign["location_id"]})

    if not location:
        return jsonify({'error': 'Location not found'}), 404
    campaign_data = {
        "campaign_id": str(campaign["_id"]),
        "title": campaign["title"],
        "description": campaign["description"],
        "cause": campaign["cause"],
        "event_type": campaign["event_type"],
        "event_date": campaign["event_date"],
        "state": location["state"], 
        "street_name": location["street_name"], 
        "image_url": campaign["image_url"],
        "donations":[str(donation_id) for donation_id in campaign.get("donations", [])],
    }
    end_time = time.time()  # End the timer
    elapsed_time = end_time - start_time  # Calculate elapsed time
    
    print(f"Time taken: {elapsed_time:.2f} seconds")  # Log the elapsed time

    return jsonify(campaign_data), 200

if __name__ == '__main__':
    app.run(debug=True)
