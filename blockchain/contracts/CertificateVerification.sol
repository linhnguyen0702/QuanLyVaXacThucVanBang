// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CertificateVerification
 * @dev Smart contract for managing and verifying digital certificates
 */
contract CertificateVerification is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _certificateIds;

    struct Certificate {
        uint256 id;
        string certificateCode;
        string studentName;
        string studentId;
        string university;
        string major;
        string degreeType;
        uint256 issueDate;
        string certificateHash;
        address issuedBy;
        bool isValid;
        uint256 timestamp;
    }

    // Mapping from certificate ID to Certificate
    mapping(uint256 => Certificate) public certificates;
    
    // Mapping from certificate code to certificate ID
    mapping(string => uint256) public certificateCodeToId;
    
    // Mapping from certificate hash to certificate ID
    mapping(string => uint256) public certificateHashToId;
    
    // Mapping of authorized issuers (schools)
    mapping(address => bool) public authorizedIssuers;

    // Events
    event CertificateIssued(
        uint256 indexed certificateId,
        string certificateCode,
        string studentName,
        address indexed issuedBy,
        uint256 timestamp
    );

    event CertificateRevoked(
        uint256 indexed certificateId,
        string certificateCode,
        address indexed revokedBy,
        uint256 timestamp
    );

    event IssuerAuthorized(address indexed issuer, uint256 timestamp);
    event IssuerRevoked(address indexed issuer, uint256 timestamp);

    // Modifiers
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Not authorized issuer");
        _;
    }

    constructor() Ownable(msg.sender) {
        // Contract deployer is automatically an authorized issuer
        authorizedIssuers[msg.sender] = true;
    }

    /**
     * @dev Authorize a new issuer (school)
     * @param issuer Address of the issuer to authorize
     */
    function authorizeIssuer(address issuer) external onlyOwner {
        require(!authorizedIssuers[issuer], "Already authorized");
        authorizedIssuers[issuer] = true;
        emit IssuerAuthorized(issuer, block.timestamp);
    }

    /**
     * @dev Revoke an issuer's authorization
     * @param issuer Address of the issuer to revoke
     */
    function revokeIssuer(address issuer) external onlyOwner {
        require(authorizedIssuers[issuer], "Not authorized");
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer, block.timestamp);
    }

    /**
     * @dev Issue a new certificate
     * @param _certificateCode Unique certificate code
     * @param _studentName Name of the student
     * @param _studentId Student ID
     * @param _university Name of the university
     * @param _major Major/field of study
     * @param _degreeType Type of degree
     * @param _issueDate Issue date (Unix timestamp)
     * @param _certificateHash Hash of the certificate document
     */
    function issueCertificate(
        string memory _certificateCode,
        string memory _studentName,
        string memory _studentId,
        string memory _university,
        string memory _major,
        string memory _degreeType,
        uint256 _issueDate,
        string memory _certificateHash
    ) external onlyAuthorizedIssuer returns (uint256) {
        require(bytes(_certificateCode).length > 0, "Certificate code required");
        require(certificateCodeToId[_certificateCode] == 0, "Certificate code already exists");
        require(certificateHashToId[_certificateHash] == 0, "Certificate hash already exists");

        _certificateIds.increment();
        uint256 newCertificateId = _certificateIds.current();

        Certificate memory newCertificate = Certificate({
            id: newCertificateId,
            certificateCode: _certificateCode,
            studentName: _studentName,
            studentId: _studentId,
            university: _university,
            major: _major,
            degreeType: _degreeType,
            issueDate: _issueDate,
            certificateHash: _certificateHash,
            issuedBy: msg.sender,
            isValid: true,
            timestamp: block.timestamp
        });

        certificates[newCertificateId] = newCertificate;
        certificateCodeToId[_certificateCode] = newCertificateId;
        certificateHashToId[_certificateHash] = newCertificateId;

        emit CertificateIssued(
            newCertificateId,
            _certificateCode,
            _studentName,
            msg.sender,
            block.timestamp
        );

        return newCertificateId;
    }

    /**
     * @dev Revoke a certificate
     * @param _certificateId ID of the certificate to revoke
     */
    function revokeCertificate(uint256 _certificateId) external onlyAuthorizedIssuer {
        require(_certificateId > 0 && _certificateId <= _certificateIds.current(), "Invalid certificate ID");
        Certificate storage cert = certificates[_certificateId];
        require(cert.issuedBy == msg.sender, "Not certificate issuer");
        require(cert.isValid, "Certificate already revoked");

        cert.isValid = false;

        emit CertificateRevoked(
            _certificateId,
            cert.certificateCode,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Verify certificate by code
     * @param _certificateCode Certificate code to verify
     */
    function verifyCertificateByCode(string memory _certificateCode) 
        external 
        view 
        returns (
            bool isValid,
            uint256 certificateId,
            string memory studentName,
            string memory university,
            string memory major,
            uint256 issueDate
        ) 
    {
        uint256 certId = certificateCodeToId[_certificateCode];
        if (certId == 0) {
            return (false, 0, "", "", "", 0);
        }

        Certificate memory cert = certificates[certId];
        return (
            cert.isValid,
            cert.id,
            cert.studentName,
            cert.university,
            cert.major,
            cert.issueDate
        );
    }

    /**
     * @dev Verify certificate by hash
     * @param _certificateHash Certificate hash to verify
     */
    function verifyCertificateByHash(string memory _certificateHash) 
        external 
        view 
        returns (
            bool isValid,
            uint256 certificateId,
            string memory certificateCode
        ) 
    {
        uint256 certId = certificateHashToId[_certificateHash];
        if (certId == 0) {
            return (false, 0, "");
        }

        Certificate memory cert = certificates[certId];
        return (cert.isValid, cert.id, cert.certificateCode);
    }

    /**
     * @dev Get certificate details by ID
     * @param _certificateId Certificate ID
     */
    function getCertificate(uint256 _certificateId) 
        external 
        view 
        returns (Certificate memory) 
    {
        require(_certificateId > 0 && _certificateId <= _certificateIds.current(), "Invalid certificate ID");
        return certificates[_certificateId];
    }

    /**
     * @dev Get total number of certificates issued
     */
    function getTotalCertificates() external view returns (uint256) {
        return _certificateIds.current();
    }
}
