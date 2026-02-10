cd external_api                                                                                              
python -m venv venv                                                                                          
source venv/bin/activate  # or venv\Scripts\activate on Windows                                              
pip install -r requirements.txt                                                                              
cp .env.example .env                                                                                         
python main.py 


# 1. Stop and remove containers
docker-compose down

# 2. Rebuild the container
docker-compose up -d --build

# 3. Watch logs closely
docker-compose logs -f api