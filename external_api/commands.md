cd external_api                                                                                              
python -m venv venv                                                                                          
source venv/bin/activate  # or venv\Scripts\activate on Windows                                              
pip install -r requirements.txt                                                                              
cp .env.example .env                                                                                         
python main.py 