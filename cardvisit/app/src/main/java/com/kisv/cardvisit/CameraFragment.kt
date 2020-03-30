package com.kisv.cardvisit

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import androidx.navigation.findNavController
import com.google.common.util.concurrent.ListenableFuture

class CameraFragment : Fragment() {

    private lateinit var navBtn: Button
    private lateinit var cameraProviderFuture: ListenableFuture<ProcessCameraProvider>

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        cameraProviderFuture = ProcessCameraProvider.getInstance(this)
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_camera, container, false)
        navBtn = view.findViewById(R.id.nav_btn)
        navBtn.setOnClickListener {
            view.findNavController()
                .navigate(CameraFragmentDirections.actionCameraToScanResult())
        }
        return view
    }

}
