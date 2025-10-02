terraform {
  backend "s3" {
    bucket = "{{projectName}}-terraform-state"
    key    = "staging/terraform.tfstate"
    region = "us-east-1"
    dynamodb_table = "{{projectName}}-terraform-locks"
    encrypt = true
  }
}
