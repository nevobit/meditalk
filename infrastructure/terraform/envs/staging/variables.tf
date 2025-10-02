variable "region" { type = string }
variable "project" { type = string }
variable "domain" { type = string }      # e.g. {{projectName}}.dev
variable "zone_id" { type = string }     # Route53 hosted zone id
variable "cidr" { type = string }        # 10.0.0.0/16