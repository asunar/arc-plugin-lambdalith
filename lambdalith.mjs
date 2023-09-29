export let deploy = {

  async start({ cloudformation }) {

    cloudformation.Resources.Role.Properties.Policies.push({
      PolicyName: "ArcLambdaVPCExec",
      PolicyDocument: {
        Statement: [
          {
            Effect: "Allow",
            Action: [
              "ec2:CreateNetworkInterface",
              "ec2:DescribeNetworkInterfaces",
              "ec2:DeleteNetworkInterface"
            ],
            Resource: "*"
          }
        ]
      }
    })

    cloudformation.Resources.MyVPC = {
      Type: "AWS::EC2::VPC",
      Properties: {
        CidrBlock: "10.0.0.0/16"
      }
    }

    cloudformation.Resources.LambdaSecurityGroup = {
      Type: "AWS::EC2::SecurityGroup",
      Properties: {
        "GroupDescription": "Enable Lambda access",
        "VpcId": { "Ref": "MyVPC" }
      }
    }

    cloudformation.Resources.AnyCatchallHTTPLambda.Properties.VpcConfig = {
      SubnetIds: [
        { Ref: "PrivateSubnet" }
      ],
      SecurityGroupIds: [
        { Ref: "LambdaSecurityGroup" }
      ]
    }

    cloudformation.Resources.PublicSubnet = {
      Type: "AWS::EC2::Subnet",
      Properties: {
        VpcId: { Ref: "MyVPC" },
        CidrBlock: "10.0.1.0/24",
        MapPublicIpOnLaunch: true
      }
    }

    cloudformation.Resources.PrivateSubnet = {
      Type: "AWS::EC2::Subnet",
      Properties: {
        VpcId: { "Ref": "MyVPC" },
        CidrBlock: "10.0.2.0/24",
        AvailabilityZone: "us-west-2a"
      }
    }

    cloudformation.Resources.PrivateSubnet2 = {
      Type: "AWS::EC2::Subnet",
      Properties: {
        VpcId: { "Ref": "MyVPC" },
        CidrBlock: "10.0.3.0/24",
        AvailabilityZone: "us-west-2b"
      }
    }

    cloudformation.Resources.NatEip = {
      Type: "AWS::EC2::EIP"
    }

    cloudformation.Resources.NatGateway = {
      Type: "AWS::EC2::NatGateway",
      Properties: {
        AllocationId: { "Fn::GetAtt": ["NatEip", "AllocationId"] },
        SubnetId: { "Ref": "PublicSubnet" }
      }
    }

    cloudformation.Resources.InternetGateway = {
      Type: "AWS::EC2::InternetGateway"
    }

    cloudformation.Resources.AttachGateway = {
      Type: "AWS::EC2::VPCGatewayAttachment",
      Properties: {
        VpcId: { Ref: "MyVPC" },
        InternetGatewayId: { Ref: "InternetGateway" }
      }
    }

    cloudformation.Resources.MyDB = {
      Type: "AWS::RDS::DBInstance",
      Properties: {
        BackupRetentionPeriod: 0,
        DeleteAutomatedBackups: true,
        AllocatedStorage: "20",
        DBInstanceClass: "db.t3.micro",
        Engine: "postgres",
        EngineVersion: "15.3", 
        MasterUsername: "superuser",
        MasterUserPassword: "adminpassword",
        VPCSecurityGroups: [
          { Ref: "DBSecurityGroup" }
        ],
        DBSubnetGroupName: { Ref: "DBSubnetGroup" }
      }
    }

    cloudformation.Resources.DBSecurityGroup = {
      Type: "AWS::EC2::SecurityGroup",
      Properties: {
        GroupDescription: "Enable PostgreSQL access",
        VpcId: { Ref: "MyVPC" },
        SecurityGroupIngress: [
          {
            IpProtocol: "tcp",
            FromPort: "5432",
            ToPort: "5432",
            CidrIp: "10.0.0.0/16"
          }
        ]
      }
    }

    cloudformation.Resources.DBSubnetGroup = {
      Type: "AWS::RDS::DBSubnetGroup",
      Properties: {
        DBSubnetGroupDescription: "Subnets for RDS",
        SubnetIds: [
          { Ref: "PrivateSubnet" },
          { Ref: "PrivateSubnet2" }
        ]
      }
    }

    return cloudformation
  }
  // end deploy.start
}
