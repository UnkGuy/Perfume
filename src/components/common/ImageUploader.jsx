import React, { useState } from 'react';
import { Loader2, UploadCloud, AlertCircle } from 'lucide-react';
import { supabase } from '../../services/supabase';

const ImageUploader = ({ onUploadSuccess, onError, bucketName = 'product-images' }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const processAndUploadFile = (file) => {
    // 1. STRICT FILE CHECK: Make sure it's actually an image
    if (!file.type.startsWith('image/')) {
      if (onError) onError('Invalid file type. Please upload a JPG, PNG, or WEBP image.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        // --- COMPRESSION LOGIC ---
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; 
        const scaleSize = MAX_WIDTH / img.width;
        
        // Only scale down if the image is wider than 800px
        if (scaleSize < 1) {
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert canvas to a compressed JPEG blob
        canvas.toBlob(async (blob) => {
          const fileName = `perfume_${Date.now()}.jpg`;
          
          // --- SUPABASE UPLOAD ---
          const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(fileName, blob, { 
              contentType: 'image/jpeg',
              upsert: true // Allows overwriting if a file with the same name exists
            });

          if (error) {
            console.error("Storage Error:", error);
            setIsUploading(false);
            if (onError) onError(`Upload failed: ${error.message}`); 
          } else {
            // Use data.path to guarantee we are getting the exact file we just uploaded
            const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(data.path);
            setIsUploading(false);
            onUploadSuccess(publicUrlData.publicUrl); 
          }
        }, 'image/jpeg', 0.85);
      };
    };
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processAndUploadFile(e.target.files[0]);
    }
  };

  return (
    <div 
      className="relative"
      onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          processAndUploadFile(e.dataTransfer.files[0]);
        }
      }}
    >
      <input 
        type="file" 
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        disabled={isUploading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
      />
      <div className={`w-full bg-black/50 border-2 border-dashed rounded-lg p-6 text-center transition-all flex flex-col items-center justify-center gap-3 
        ${isUploading ? 'border-gray-600 text-gray-500 bg-black/80' : 
          dragActive ? 'border-gold-400 bg-gold-400/10 text-gold-400' : 'border-white/20 text-gray-400 hover:border-gold-400/50 hover:text-gold-400'}`}
      >
        {isUploading ? (
          <>
            <Loader2 className="animate-spin text-gold-400" size={28} />
            <div>
              <p className="text-sm font-bold text-white mb-1">Processing Image...</p>
              <p className="text-xs">Compressing and uploading to server</p>
            </div>
          </>
        ) : (
          <>
            <UploadCloud size={28} />
            <div>
              <p className="text-sm font-bold text-white mb-1">Click or drag image here</p>
              <p className="text-xs">Supports JPG, PNG, WEBP (Max 800px width)</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;